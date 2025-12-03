import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { FormsModule } from "@angular/forms";
import {
	ProductsService,
	PriceCategory,
} from "../../services/products.service";

@Component({
	selector: "app-price-filter",
	standalone: true,
	imports: [CommonModule, MatButtonToggleModule, FormsModule],
	templateUrl: "./price-filter.component.html",
	styleUrl: "./price-filter.component.css",
})
export class PriceFilterComponent {
	priceCategories: PriceCategory[];
	selectedCategory: PriceCategory;

	constructor(private productsService: ProductsService) {
		this.priceCategories = this.productsService.priceCategories;
		this.selectedCategory = this.priceCategories[0];
	}

	onCategoryChange(category: PriceCategory): void {
		this.selectedCategory = category;
		this.productsService.priceFilter.next(category);
	}
}
