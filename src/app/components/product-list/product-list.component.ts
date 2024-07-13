import { Component, OnInit } from "@angular/core";
import { ProductsService } from "../../services/products.service";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { ProductItemComponent } from "../product-item/product-item.component";

@Component({
	selector: "app-product-list",
	standalone: true,
	imports: [NgFor, AsyncPipe, NgIf, ProductItemComponent],
	templateUrl: "./product-list.component.html",
	styleUrl: "./product-list.component.css",
})
export class ProductListComponent implements OnInit {
	constructor(private productsService: ProductsService) {}

	products$ = this.productsService.products$;

	ngOnInit(): void {
		this.productsService.getAll().subscribe();
	}
}
