import { Component, OnInit, ViewChild } from "@angular/core";
import { ProductsService } from "../../services/products.service";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { ProductItemComponent } from "../product-item/product-item.component";
import { MatTableDataSource } from "@angular/material/table";
import {
	MatPaginator,
	MatPaginatorModule,
	PageEvent,
} from "@angular/material/paginator";
import { IProduct } from "../../models/product.model";
import { merge } from "rxjs";

@Component({
	selector: "app-product-list",
	standalone: true,
	imports: [NgFor, AsyncPipe, NgIf, ProductItemComponent, MatPaginatorModule],
	templateUrl: "./product-list.component.html",
	styleUrl: "./product-list.component.css",
})
export class ProductListComponent implements OnInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	dataSource = new MatTableDataSource<IProduct>();
	pageEvent!: PageEvent;
	pageSizeOptions: number[] = [5, 10, 50];
	pageIndex!: number;
	pageSize!: number;
	length!: number;
	products$ = this.productsService.products$;

	constructor(private productsService: ProductsService) {}

	ngOnInit(): void {
		this.dataSource.paginator = this.paginator;
		this.pageIndex = 0;
		this.pageSize = 10;
		this.productsService.pagination.next({
			page: this.pageIndex,
			pageSize: this.pageSize,
		});
		merge(
			this.productsService.pagination,
			this.productsService.searchTerm,
			this.productsService.priceFilter,
		).subscribe(() =>
			this.productsService.getAll().subscribe(res => {
				this.dataSource.data = res.products;
				this.length = res.totalProducts;
				if (
					!res.products.length &&
					this.productsService.pagination.getValue().page !== 0
				) {
					this.paginator.firstPage();
				}
			}),
		);

		this.products$.subscribe(prods => (this.dataSource.data = prods!));
	}

	handlePageEvent(event: PageEvent) {
		const pageSize = event.pageSize;
		const page = event.pageIndex;
		this.productsService.pagination.next({ page, pageSize });
		return event;
	}
}
