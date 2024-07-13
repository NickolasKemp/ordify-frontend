import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductsService } from "../../services/products.service";
import { CustomerFormComponent } from "../../customer-form/customer-form.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { EnumDeliveryWay } from "../../models/product.model";
import { AsyncPipe, CurrencyPipe, NgIf } from "@angular/common";
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

interface IDeliverySelect {
	value: string;
	viewValue: string;
}

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
	],

	templateUrl: "./order-page.component.html",
	styleUrl: "./order-page.component.css",
})
export class OrderPageComponent implements OnInit {
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

	delivery: IDeliverySelect[] = [
		{ value: EnumDeliveryWay.COURIER, viewValue: EnumDeliveryWay.COURIER },
		{ value: EnumDeliveryWay.PICKUP, viewValue: EnumDeliveryWay.PICKUP },
		{ value: EnumDeliveryWay.POSTAL, viewValue: EnumDeliveryWay.POSTAL },
	];

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
			});
	}

	markFormGroupTouched(formGroup: FormGroup) {
		Object.values(formGroup.controls).forEach(control => {
			control.markAsTouched();
			control.markAsDirty();
		});
	}

	calcTotal() {
		const quantity = this.productData.get("quantity")?.value;
		if (quantity < 1) return;

		const prodPrice = this.product$.getValue()?.price;

		if (prodPrice) {
			if (!quantity) {
				return this.totalPrice.set(prodPrice);
			}

			if (quantity <= this.quantityLimit) {
				this.totalPrice.set(quantity * prodPrice);
			} else {
				this.totalPrice.set(this.quantityLimit * prodPrice);
			}
		}
	}
}

// Todo: button disabled on is loading
// Todo: implement payment
// Todo: validation on checking wether amount is less than 1
