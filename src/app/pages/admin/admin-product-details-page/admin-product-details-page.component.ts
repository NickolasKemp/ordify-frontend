import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductsService } from "../../../services/products.service";
import { ConfirmationDialogService } from "../../../services/confirmation-dialog.service";
import { MatInputModule } from "@angular/material/input";
import { AsyncPipe, NgFor, NgIf, NgStyle } from "@angular/common";
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
} from "@angular/forms";
import {
	DeliveryOption,
	EnumDeliveryWay,
	IProduct,
} from "../../../models/product.model";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-admin-product-details-page",
	standalone: true,
	imports: [
		MatInputModule,
		NgIf,
		AsyncPipe,
		ReactiveFormsModule,
		MatSelectModule,
		MatButtonModule,
		NgStyle,
		MatIconModule,
		NgFor,
	],
	templateUrl: "./admin-product-details-page.component.html",
	styleUrl: "./admin-product-details-page.component.css",
})
export class AdminProductDetailsPageComponent implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private productsService: ProductsService,
		private dialog: ConfirmationDialogService,
		private router: Router,
		private fb: FormBuilder,
	) {}

	ngOnInit() {
		const productId = this.route.snapshot.paramMap.get("id")!;
		this.productsService.getById(productId).subscribe(product => {
			this.productData = this.fb.group({
				name: [product.name],
				description: [product.description],
				deliveryWay: [],
				deliveryOptions: this.fb.array(
					this.createDeliveryOptions(product.deliveryOptions),
				),
				quantity: [product.quantity],
				price: [product.price],
				image: [product.image],
			});
			this.deliveryWays = product.deliveryOptions.map(option => option.type);
			this.allDeliveryWays = Object.values(EnumDeliveryWay);
			this.availableDeliveryWays = this.allDeliveryWays.filter(
				way => !this.deliveryWays.includes(way),
			);

			this.productData.patchValue({
				name: product.name,
				description: product.description,
				quantity: product.quantity,
				price: product.price,
				image: product.image,
			});

			const deliveryOptionsArray = this.productData.get(
				"deliveryOptions",
			) as FormArray;
			deliveryOptionsArray.clear();
			product.deliveryOptions.forEach(option => {
				deliveryOptionsArray.push(
					this.fb.group({
						type: [option.type],
						period: [option.period],
						price: [option.price],
					}),
				);
			});
		});
	}

	deliveryWays!: EnumDeliveryWay[];
	availableDeliveryWays!: EnumDeliveryWay[];
	allDeliveryWays!: EnumDeliveryWay[];

	productData!: FormGroup;
	product$ = this.productsService.productById$;

	isImgInputDisplayNone = signal(true);

	createDeliveryOptions(deliveryOptions: DeliveryOption[]): FormGroup[] {
		return deliveryOptions.map(option =>
			this.fb.group({
				type: [option.type],
				period: [option.period],
				price: [option.price],
			}),
		);
	}

	get deliveryOptions(): FormArray {
		return this.productData.get("deliveryOptions") as FormArray;
	}

	get deliveryOptionsControls(): AbstractControl[] {
		return this.deliveryOptions.controls;
	}

	getFormGroupAtIndex(index: number) {
		return this.deliveryOptionsControls[index] as FormGroup;
	}

	toggleIsImgInputDisplay() {
		this.isImgInputDisplayNone.set(false);
	}

	confirmCancelDialog() {
		this.dialog
			.confirmDialog({
				title: "Confirm Action",
				message: `Are you sure you want to delete this product? All orders related to it will also be deleted`,
				confirmCaption: "Confirm",
				cancelCaption: "Cancel",
			})
			.subscribe(confirmed => {
				if (confirmed)
					this.productsService
						.delete(this.route.snapshot.paramMap.get("id")!)
						.subscribe(() => this.router.navigate(["admin/products"]));
			});
	}

	onProductUpdate() {
		const updatedProdFields: Partial<IProduct> = {};

		Object.keys(this.productData.controls).forEach(controlName => {
			const control = this.productData.get(controlName);

			if (control && control.touched) {
				updatedProdFields[controlName as keyof IProduct] = control.value;
			}
		});
		this.productsService
			.update(this.route.snapshot.paramMap.get("id")!, updatedProdFields)
			.subscribe(() => this.router.navigate(["admin/products"]));
	}

	addDeliveryWay() {
		const selectedDeliveryWay = this.productData.get("deliveryWay")!.value;

		if (
			!selectedDeliveryWay ||
			!this.availableDeliveryWays.includes(selectedDeliveryWay)
		)
			return;

		const newDeliveryOption = new DeliveryOption(selectedDeliveryWay);
		this.productsService
			.addDeliveryOption(
				this.route.snapshot.paramMap.get("id")!,
				newDeliveryOption,
			)
			.subscribe(product =>
				this.updateDeliveryOptions(product.deliveryOptions),
			);
	}

	deleteDeliveryWay(deliveryOptionId: string) {
		if (deliveryOptionId === EnumDeliveryWay.PICKUP) return;
		this.productsService
			.deleteDeliveryOption(
				this.route.snapshot.paramMap.get("id")!,
				deliveryOptionId,
			)
			.subscribe(product =>
				this.updateDeliveryOptions(product.deliveryOptions),
			);
	}

	updateDeliveryOptions(deliveryOptions: DeliveryOption[]) {
		const deliveryOptionsArray = this.productData.get(
			"deliveryOptions",
		) as FormArray;
		deliveryOptionsArray.clear();
		deliveryOptions.forEach(option => {
			deliveryOptionsArray.push(
				this.fb.group({
					type: [option.type],
					period: [option.period],
					price: [option.price],
				}),
			);
		});
		this.deliveryWays = deliveryOptions.map(option => option.type);
		this.availableDeliveryWays = this.allDeliveryWays.filter(
			way => !this.deliveryWays.includes(way),
		);
	}
}
