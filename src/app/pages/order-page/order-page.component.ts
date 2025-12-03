import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductsService } from "../../services/products.service";
import { CustomerFormComponent } from "../../components/customer-form/customer-form.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { IDeliveryOption } from "../../models/product.model";
import {
	AsyncPipe,
	CurrencyPipe,
	DatePipe,
	NgFor,
	NgIf,
} from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from "@angular/forms";
import { OrdersService } from "../../services/orders.service";
import { CustomersService } from "../../services/customers.service";
import { merge } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PaymentService } from "../../services/payment.service";
import { MatStepperModule } from "@angular/material/stepper";
import { MatIconModule } from "@angular/material/icon";
import { AgreementService } from "../../services/agreement.service";
import {
	IAgreement,
	AGREEMENT_PERIOD_OPTIONS,
	IAgreementPeriodOption,
} from "../../models/agreement.model";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

type OrderStep = "review" | "payment" | "success";
type OrderMode = "new" | "returning";

@Component({
	selector: "app-order-page",
	standalone: true,
	imports: [
		CustomerFormComponent,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		NgIf,
		AsyncPipe,
		MatButtonModule,
		ReactiveFormsModule,
		CurrencyPipe,
		DatePipe,
		NgFor,
		MatStepperModule,
		MatIconModule,
		MatSnackBarModule,
	],

	templateUrl: "./order-page.component.html",
	styleUrl: "./order-page.component.css",
})
export class OrderPageComponent implements OnInit {
	isLoading = signal(false);
	currentStep = signal<OrderStep>("review");
	createdOrderId = signal<string | null>(null);
	paymentError = signal<string | null>(null);

	// Agreement-related signals
	orderMode = signal<OrderMode>("new");
	hasExistingToken = signal(false);
	currentAgreement = signal<IAgreement | null>(null);
	newClientToken = signal<string | null>(null);
	tokenValidationError = signal<string | null>(null);
	isValidatingToken = signal(false);

	// Agreement period options
	agreementPeriodOptions: IAgreementPeriodOption[] = AGREEMENT_PERIOD_OPTIONS;

	private paymentService = inject(PaymentService);
	private agreementService = inject(AgreementService);
	private clipboard = inject(Clipboard);
	private snackBar = inject(MatSnackBar);

	constructor(
		private route: ActivatedRoute,
		private productsService: ProductsService,
		private fb: FormBuilder,
		private ordersService: OrdersService,
		private customersService: CustomersService,
		private router: Router,
	) {
		this.customerData = this.fb.group({
			name: ["", Validators.required],
			contactPerson: ["", Validators.required],
			phone: ["", [Validators.required, this.phoneNumberValidator()]],
			street: ["", Validators.required],
			city: ["", Validators.required],
			state: ["", Validators.required],
			zip: ["", Validators.required],
		});

		this.productData = this.fb.group({
			quantity: [1],
			deliveryWay: ["", Validators.required],
		});

		// Payment form (Stripe test card fields)
		this.paymentData = this.fb.group({
			cardNumber: [
				"4242424242424242",
				[Validators.required, this.cardNumberValidator()],
			],
			expMonth: [
				"12",
				[Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)],
			],
			expYear: ["25", [Validators.required, Validators.pattern(/^\d{2}$/)]],
			cvc: ["123", [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
		});

		// Token form for returning customers
		this.tokenData = this.fb.group({
			clientToken: ["", Validators.required],
		});

		// Agreement form for new customers
		this.agreementData = this.fb.group({
			period: ["1_year", Validators.required],
		});

		// Legal entity form for new customers
		this.legalEntityData = this.fb.group({
			name: ["", Validators.required],
			registrationNumber: ["", Validators.required],
			directorName: ["", Validators.required],
			legalAddress: this.fb.group({
				street: ["", Validators.required],
				city: ["", Validators.required],
				state: ["", Validators.required],
				zip: ["", Validators.required],
			}),
			bankAccount: this.fb.group({
				name: ["", Validators.required],
				iban: ["", Validators.required],
			}),
		});

		merge(
			this.customerData.statusChanges,
			this.customerData.valueChanges,
			this.productData.statusChanges,
			this.productData.valueChanges,
		)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => this.updateErrorMessages());
	}

	ngOnInit() {
		const prodId = this.route.snapshot.paramMap.get("productId");
		if (prodId) {
			this.productsService.getById(prodId).subscribe(product => {
				this.totalPrice.set(product.price);
				this.quantityLimit = product.quantity;
				this.productData
					.get("quantity")
					?.setValidators([
						Validators.max(this.quantityLimit),
						Validators.min(1),
						Validators.required,
					]);
				this.productData.get("quantity")?.updateValueAndValidity();
			});
		}

		// Check for existing client token
		this.checkExistingToken();
	}

	/**
	 * Check if there's an existing valid client token
	 */
	private checkExistingToken(): void {
		const storedToken = this.agreementService.getClientToken();
		if (storedToken) {
			this.tokenData.patchValue({ clientToken: storedToken });
			this.validateClientToken(storedToken);
		}
	}

	/**
	 * Validate a client token
	 */
	validateClientToken(token: string): void {
		if (!token) {
			this.tokenValidationError.set("Please enter a token");
			return;
		}

		this.isValidatingToken.set(true);
		this.tokenValidationError.set(null);

		this.agreementService.validateToken(token).subscribe({
			next: response => {
				if (response.valid) {
					this.hasExistingToken.set(true);
					this.currentAgreement.set(response.agreement);
					this.orderMode.set("returning");
					// Pre-fill customer data from agreement
					if (response.agreement.customer) {
						this.customerData.patchValue(response.agreement.customer);
						this.customerData.disable();
					}
				}
				this.isValidatingToken.set(false);
			},
			error: () => {
				this.tokenValidationError.set("Invalid or expired token");
				this.hasExistingToken.set(false);
				this.currentAgreement.set(null);
				this.isValidatingToken.set(false);
			},
		});
	}

	/**
	 * Switch to new customer mode
	 */
	switchToNewCustomer(): void {
		this.orderMode.set("new");
		this.hasExistingToken.set(false);
		this.currentAgreement.set(null);
		this.customerData.enable();
		this.customerData.reset();
		this.tokenData.reset();
		this.tokenValidationError.set(null);
	}

	/**
	 * Switch to returning customer mode
	 */
	switchToReturningCustomer(): void {
		this.orderMode.set("returning");
		this.checkExistingToken();
	}

	/**
	 * Copy client token to clipboard
	 */
	copyToken(): void {
		const token = this.newClientToken();
		if (token) {
			this.clipboard.copy(token);
			this.snackBar.open("Token copied to clipboard!", "Close", {
				duration: 3000,
			});
		}
	}

	private destroyRef = inject(DestroyRef);

	customerData: FormGroup;
	productData: FormGroup;
	paymentData: FormGroup;
	tokenData: FormGroup;
	agreementData: FormGroup;
	legalEntityData: FormGroup;

	product$ = this.productsService.productById$;

	quantityLimit = 0;

	totalPrice = signal(0);

	customerErrorSignals: Record<string, string> = {
		name: "",
		contactPerson: "",
		phone: "",
		street: "",
		city: "",
		state: "",
		zip: "",
	};

	productErrorSignals: Record<string, string> = {
		quantity: "",
		deliveryWay: "",
	};

	errorMessages = signal({
		customer: {
			...this.customerErrorSignals,
		},
		product: {
			...this.productErrorSignals,
		},
	});

	currentDeliveryOption = signal<IDeliveryOption | null>(null);

	updateErrorMessages() {
		const customerErrors: Record<string, string> = {};
		const productErrors: Record<string, string> = {};

		Object.keys(this.customerData.controls).forEach(key => {
			const controlErrors = this.customerData.get(key)?.errors;
			if (controlErrors) {
				if (controlErrors["required"]) {
					customerErrors[key] = "You must enter a value";
				}

				if (controlErrors["invalidPhoneNumber"]) {
					customerErrors[key] = "Phone number must be 10 digits";
				}
			}
		});

		Object.keys(this.productData.controls).forEach(key => {
			const controlErrors = this.productData.get(key)?.errors;
			if (controlErrors) {
				if (controlErrors["required"]) {
					productErrors[key] = "You must enter a value";
				}

				if (controlErrors["max"]) {
					productErrors[key] = "Enter less value";
				}

				if (controlErrors["min"]) {
					productErrors[key] = "Enter a positive value";
				}
			}
		});

		this.errorMessages.set({
			customer: customerErrors,
			product: productErrors,
		});
	}

	phoneNumberValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const valid = /^[0-9]{10}$/.test(control.value);
			return valid ? null : { invalidPhoneNumber: true };
		};
	}

	cardNumberValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value?.replace(/\s/g, "");
			const valid = /^\d{13,19}$/.test(value);
			return valid ? null : { invalidCardNumber: true };
		};
	}

	// Крок 1: Натиснути "Замовити" - створює замовлення та переходить до оплати
	onPlaceOrder() {
		// For returning customers, use token-based order
		if (this.orderMode() === "returning" && this.hasExistingToken()) {
			this.placeOrderWithToken();
			return;
		}

		// For new customers, create order with agreement
		if (
			this.customerData.invalid ||
			this.productData.invalid ||
			this.legalEntityData.invalid ||
			this.agreementData.invalid
		) {
			this.updateErrorMessages();
			this.markFormGroupTouched(this.customerData);
			this.markFormGroupTouched(this.productData);
			this.markFormGroupTouched(this.legalEntityData);
			this.markFormGroupTouched(this.agreementData);
			return;
		}

		this.isLoading.set(true);
		this.paymentError.set(null);

		this.customersService.create(this.customerData.value).subscribe({
			next: customer => {
				const order = {
					...this.productData.value,
					price: this.totalPrice(),
					quantity: this.productData.get("quantity")?.value
						? this.productData.get("quantity")?.value
						: 1,
				};

				const productId = this.product$.getValue()?._id;

				// Calculate ends_at based on selected period
				const selectedPeriod = this.agreementPeriodOptions.find(
					opt => opt.value === this.agreementData.get("period")?.value,
				);
				const endsAt = new Date();
				endsAt.setMonth(endsAt.getMonth() + (selectedPeriod?.months || 12));

				const agreementData = {
					ends_at: endsAt,
					legalEntity: this.legalEntityData.value,
				};

				if (productId) {
					// Create order with agreement (first order)
					this.ordersService
						.createWithAgreement(order, customer._id, productId, agreementData)
						.subscribe({
							next: response => {
								this.createdOrderId.set(response.order._id);
								// Save and display the client token
								this.newClientToken.set(response.clientToken);
								this.agreementService.saveClientToken(response.clientToken);
								this.currentStep.set("payment");
								this.isLoading.set(false);
							},
							error: () => this.isLoading.set(false),
						});
				}
			},
			error: () => this.isLoading.set(false),
		});
	}

	/**
	 * Place order using existing client token
	 */
	private placeOrderWithToken(): void {
		if (this.productData.invalid) {
			this.updateErrorMessages();
			this.markFormGroupTouched(this.productData);
			return;
		}

		const clientToken = this.tokenData.get("clientToken")?.value;
		if (!clientToken) {
			this.tokenValidationError.set("Client token is required");
			return;
		}

		this.isLoading.set(true);
		this.paymentError.set(null);

		const order = {
			...this.productData.value,
			price: this.totalPrice(),
			quantity: this.productData.get("quantity")?.value
				? this.productData.get("quantity")?.value
				: 1,
		};

		const productId = this.product$.getValue()?._id;

		if (productId) {
			this.ordersService
				.createWithToken(order, productId, clientToken)
				.subscribe({
					next: createdOrder => {
						this.createdOrderId.set(createdOrder._id);
						this.currentStep.set("payment");
						this.isLoading.set(false);
					},
					error: err => {
						this.tokenValidationError.set(
							err.error?.message || "Failed to create order with token",
						);
						this.isLoading.set(false);
					},
				});
		}
	}

	// Крок 2: Натиснути "Оплатити" - обробляє платіж
	onConfirmPayment() {
		if (this.paymentData.invalid) {
			this.markFormGroupTouched(this.paymentData);
			return;
		}

		const orderId = this.createdOrderId();
		if (!orderId) {
			this.paymentError.set("Order not found");
			return;
		}

		this.isLoading.set(true);
		this.paymentError.set(null);

		const cardDetails = {
			cardNumber: this.paymentData.get("cardNumber")?.value,
			expMonth: this.paymentData.get("expMonth")?.value,
			expYear: this.paymentData.get("expYear")?.value,
			cvc: this.paymentData.get("cvc")?.value,
		};

		this.paymentService.payOrder(orderId, cardDetails).subscribe({
			next: result => {
				if (result.success) {
					this.router.navigate(["/order/payment/success"], {
						queryParams: { orderId: orderId },
					});
				}
			},
			error: err => {
				this.paymentError.set(
					err.error?.message || "Payment failed. Please try again.",
				);
				this.isLoading.set(false);
			},
		});
	}

	// Повернутися до форми замовлення
	onBackToReview() {
		this.currentStep.set("review");
		this.paymentError.set(null);
	}

	markFormGroupTouched(formGroup: FormGroup) {
		Object.values(formGroup.controls).forEach(control => {
			control.markAsTouched();
			control.markAsDirty();
		});
	}

	onDeliveryWayChange(deliveryWay: string, deliveryOptions: IDeliveryOption[]) {
		const currentOption = this.findDeliveryOptionByDeliveryWay(
			deliveryWay,
			deliveryOptions,
		)!;

		this.calcTotal(currentOption);
		return this.currentDeliveryOption.set(currentOption);
	}

	findDeliveryOptionByDeliveryWay(
		deliveryWay: string,
		deliveryOptions: IDeliveryOption[],
	) {
		return deliveryOptions.find(option => option.type === deliveryWay);
	}

	calcTotal(currentOption?: IDeliveryOption) {
		let totalProdsPrice = 0;
		const quantity = this.productData.get("quantity")?.value;
		if (quantity < 1) return;
		const prodPrice = this.product$.getValue()?.price;
		if (!currentOption) {
			const deliveryOptions = this.product$.getValue()!.deliveryOptions;
			const chosenDeliveryWay = this.productData.get("deliveryWay")!.value;
			currentOption = this.findDeliveryOptionByDeliveryWay(
				chosenDeliveryWay,
				deliveryOptions,
			);
		}

		const deliveryPrice = currentOption?.price ? currentOption?.price : 0;
		if (prodPrice) {
			if (!quantity) {
				totalProdsPrice = prodPrice;
				return this.totalPrice.set(totalProdsPrice + deliveryPrice!);
			}

			if (quantity <= this.quantityLimit) {
				totalProdsPrice = quantity * prodPrice;
			} else {
				totalProdsPrice = this.quantityLimit * prodPrice;
			}
		}
		return this.totalPrice.set(totalProdsPrice + deliveryPrice!);
	}
}
