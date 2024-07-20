import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnInit,
	signal,
} from "@angular/core";
import { EnumDeliveryWay, IProduct } from "../../models/product.model";
import { CurrencyPipe, NgClass, NgIf, NgStyle } from "@angular/common";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { ProductDetailsDialogComponent } from "../product-details/product-details.component";
import { ProductsService } from "../../services/products.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";

@Component({
	selector: "app-product-item",
	standalone: true,
	imports: [
		NgIf,
		CurrencyPipe,
		NgStyle,
		MatButton,
		NgClass,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatButtonModule,
	],
	templateUrl: "./product-item.component.html",
	styleUrl: "./product-item.component.css",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItemComponent implements OnInit {
	@Input() product!: IProduct;

	EnumDeliveryWay = EnumDeliveryWay;

	isHasDelivery = signal(false);

	constructor(
		private productsService: ProductsService,
		private router: Router,
	) {}
	ngOnInit(): void {
		if (this.product) {
			this.isHasDelivery.set(
				this.product.deliveryOptions
					.map(option => option.type)
					.includes(EnumDeliveryWay.PICKUP) &&
					this.product.deliveryOptions.length === 1,
			);
		}
	}
	readonly dialog = inject(MatDialog);
	openDialog(id: string): void {
		this.productsService.getById(id).subscribe(product => {
			this.dialog.open(ProductDetailsDialogComponent, {
				data: product,
				panelClass: "app-dialog",
				minWidth: "95vw",
				height: "90vh",
			});
		});
	}

	navigateToOrder(productId: string) {
		if (this.product.quantity === 0) return;

		this.router.navigate([`order/${productId}`]);
	}

	quantityCalc(quantity: number) {
		switch (true) {
			case quantity >= 100:
				return "100+";
			case quantity >= 50:
				return "50+";
			case quantity >= 10:
				return "10+";
			case quantity >= 1:
				return "1+";
			default:
				return "not available";
		}
	}
}

// Todo: place at helpers folder quantityCalc
