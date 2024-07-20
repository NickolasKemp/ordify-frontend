import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { IProduct } from "../../models/product.model";
import { CurrencyPipe, NgFor } from "@angular/common";
import { Router } from "@angular/router";
import { ProductsService } from "../../services/products.service";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-dialog",
	templateUrl: "./product-details.component.html",
	styleUrls: ["./product-details.component.css"],
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		CurrencyPipe,
		NgFor,
		MatIconModule,
	],
})
export class ProductDetailsDialogComponent {
	readonly dialogRef = inject(MatDialogRef<ProductDetailsDialogComponent>);
	readonly data = inject<IProduct>(MAT_DIALOG_DATA);

	constructor(
		private router: Router,
		public productService: ProductsService,
	) {}

	isButtonDisabled = signal(true);

	navigateToOrder(productId: string) {
		this.dialogRef.close();
		this.router.navigate([`order/${productId}`]);
	}
}
