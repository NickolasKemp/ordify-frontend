import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductsService } from "../../services/products.service";
import { CustomerFormComponent } from "../../customer-form/customer-form.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { IDeliveryOption } from "../../models/product.model";
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { OrdersService } from "../../services/orders.service";
import { CustomersService } from "../../services/customers.service";
import { merge } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
		NgFor,
	],

	templateUrl: "./order-page.component.html",
	styleUrl: "./order-page.component.css",
})
export class OrderPageComponent implements OnInit {
	isLoading = signal(false);

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
			phone: ["", Validators.required],
			street: ["", Validators.required],
			city: ["", Validators.required],
			state: ["", Validators.required],
			zip: ["", Validators.required],
		});

		this.productData = this.fb.group({
			quantity: [1, Validators.min(1)],
			deliveryWay: ["", Validators.required],
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
					?.setValidators([Validators.max(this.quantityLimit)]);
				this.productData.get("quantity")?.updateValueAndValidity();
			});
		}
	}

	private destroyRef = inject(DestroyRef);

	customerData: FormGroup;
	productData: FormGroup;

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

	onPlaceOrder() {
		if (this.customerData.invalid || this.productData.invalid) {
			this.updateErrorMessages();
			this.markFormGroupTouched(this.customerData);
			this.markFormGroupTouched(this.productData);
			return;
		}

		this.isLoading.set(true);
		this.customersService
			.create(this.customerData.value)
			.subscribe(customer => {
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
						.create(order, customer._id, productId)
						.subscribe(() => this.router.navigate(["/order/payment/success"]));
				}
			})
			.add(() => this.isLoading.set(false));
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
