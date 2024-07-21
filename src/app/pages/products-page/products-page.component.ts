import { Component } from "@angular/core";
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { ProductItemComponent } from "../../components/product-item/product-item.component";
import { CommonModule } from "@angular/common";
import { ProductSearchComponent } from "../../components/product-search/product-search.component";

@Component({
	selector: "app-products-page",
	standalone: true,
	imports: [
		ProductListComponent,
		ProductItemComponent,
		CommonModule,
		ProductSearchComponent,
	],
	templateUrl: "./products-page.component.html",
	styleUrl: "./products-page.component.css",
})
export class ProductsPageComponent {}
