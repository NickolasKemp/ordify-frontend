import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ProductsService } from "../../../services/products.service";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Router } from "@angular/router";
import { IProduct, Product } from "../../../models/product.model";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
	selector: "app-admin-products-page",
	standalone: true,
	imports: [
		DatePipe,
		CurrencyPipe,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		MatIconModule,
		MatButtonModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatInputModule,
		FormsModule,
	],
	templateUrl: "./admin-products-page.component.html",
	styleUrl: "./admin-products-page.component.css",
})
export class AdminProductsPageComponent implements OnInit, AfterViewInit {
	constructor(
		private productsService: ProductsService,
		private _liveAnnouncer: LiveAnnouncer,
		private router: Router,
	) {}
	ngOnInit() {
		this.productsService
			.getAll()
			.subscribe(response => (this.dataSource.data = response.products));
	}
	products$ = this.productsService.products$;
	displayedColumns: string[] = [
		"position",
		"createdAt",
		"name",
		"price",
		"quantity",
		"details",
	];

	dataSource = new MatTableDataSource<IProduct>();

	@ViewChild(MatSort)
	sort!: MatSort;

	@ViewChild("paginator")
	paginator!: MatPaginator;

	readonly searchKeywordFilter = new FormControl("");

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	ngAfterViewInit() {
		this.dataSource.sortingDataAccessor = (item, property) => {
			switch (property) {
				case "created_at":
					return new Date(item.createdAt).getTime();
				default:
					return item[property as keyof IProduct] as string;
			}
		};
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;
	}

	announceSortChange(sortState: Sort) {
		if (sortState.direction) {
			this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
		} else {
			this._liveAnnouncer.announce("Sorting cleared");
		}
	}

	navigateToProduct(id: string) {
		this.router.navigate([`admin/products/${id}`]);
	}

	createProduct() {
		const product = new Product();
		this.productsService.create(product).subscribe(newProd => {
			this.navigateToProduct(newProd._id);
		});
	}
}
