import { Component, OnInit } from "@angular/core";
import { ProductsService } from "../../services/products.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { debounceTime, Subject } from "rxjs";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";

@Component({
	selector: "app-product-search",
	standalone: true,
	imports: [MatFormFieldModule, MatInputModule, FormsModule, MatIcon],
	templateUrl: "./product-search.component.html",
	styleUrl: "./product-search.component.css",
})
export class ProductSearchComponent implements OnInit {
	readonly searchKeywordFilter = "";

	private searchSubject = new Subject<string>();

	constructor(private productsService: ProductsService) {}

	ngOnInit(): void {
		this.searchSubject
			.pipe(debounceTime(300))
			.subscribe(searchValue =>
				this.productsService.searchTerm.next(searchValue),
			);
	}

	applySearch() {
		this.searchSubject.next(this.searchKeywordFilter);
	}
}
