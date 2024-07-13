import { Component } from "@angular/core";
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { ProductItemComponent } from "../../components/product-item/product-item.component";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-products-page",
	standalone: true,
	imports: [ProductListComponent, ProductItemComponent, CommonModule],
	templateUrl: "./products-page.component.html",
	styleUrl: "./products-page.component.css",
})
export class ProductsPageComponent {}

// Todo: add search
