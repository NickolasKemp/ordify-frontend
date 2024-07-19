import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrderItemComponent } from "../../../components/order-item/order-item.component";
import { OrdersService } from "../../../services/orders.service";
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { IOrder } from "../../../models/order.model";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";

@Component({
	selector: "app-admin-orders-page",
	standalone: true,
	imports: [
		OrderItemComponent,
		NgFor,
		AsyncPipe,
		MatTableModule,
		MatSortModule,
		DatePipe,
		CurrencyPipe,
		MatPaginatorModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatInputModule,
		FormsModule,
	],
	templateUrl: "./admin-orders-page.component.html",
	styleUrl: "./admin-orders-page.component.css",
})
export class AdminOrdersPageComponent implements OnInit, AfterViewInit {
	constructor(
		private orderService: OrdersService,
		private _liveAnnouncer: LiveAnnouncer,
		private router: Router,
	) {}
	ngOnInit() {
		this.orderService
			.getAll()
			.subscribe(orders => (this.dataSource.data = orders));
	}
	orders$ = this.orderService.orders$;
	displayedColumns: string[] = [
		"position",
		"createdAt",
		"product",
		"customer",
		"price",
		"details",
	];

	dataSource = new MatTableDataSource<IOrder>();

	@ViewChild(MatSort)
	sort!: MatSort;

	@ViewChild("paginator")
	paginator!: MatPaginator;

	readonly searchKeywordFilter = new FormControl();

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	ngAfterViewInit() {
		this.dataSource.sortingDataAccessor = (item, property) => {
			switch (property) {
				case "created_at":
					return new Date(item.created_at).getTime();
				case "product":
					return item.product.name;
				case "customer":
					return item.customer.name;
				default:
					return item[property as keyof IOrder] as string;
			}
		};
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;
		this.dataSource.filterPredicate = (data, filter) => {
			const transformedFilter = filter.trim().toLowerCase();
			const createdAt = new Date(data.created_at)
				.toLocaleDateString()
				.toLowerCase();
			const product = data.product.name.toLowerCase();
			const customer = data.customer.name.toLowerCase();
			return (
				createdAt.includes(transformedFilter) ||
				product.includes(transformedFilter) ||
				customer.includes(transformedFilter)
			);
		};
	}

	announceSortChange(sortState: Sort) {
		if (sortState.direction) {
			this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
		} else {
			this._liveAnnouncer.announce("Sorting cleared");
		}
	}

	navigateToOrder(id: string) {
		this.router.navigate([`admin/orders/${id}`]);
	}
}
