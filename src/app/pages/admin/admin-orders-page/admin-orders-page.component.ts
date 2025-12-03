import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrdersService } from "../../../services/orders.service";
import {
	AsyncPipe,
	CurrencyPipe,
	DatePipe,
	NgFor,
	NgClass,
} from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { IOrder, OrderStatus } from "../../../models/order.model";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";

@Component({
	selector: "app-admin-orders-page",
	standalone: true,
	imports: [
		NgFor,
		NgClass,
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
	orders$ = this.orderService.orders$;
	displayedColumns: string[] = [
		"position",
		"createdAt",
		"product",
		"customer",
		"price",
		"status",
		"details",
	];

	dataSource = new MatTableDataSource<IOrder>();

	@ViewChild(MatSort)
	sort!: MatSort;

	@ViewChild("paginator")
	paginator!: MatPaginator;

	readonly searchKeywordFilter = new FormControl();

	constructor(
		private orderService: OrdersService,
		private _liveAnnouncer: LiveAnnouncer,
		private router: Router,
	) {}

	statusLabels: Record<string, string> = {
		pending: "Pending",
		processing: "Processing",
		completed: "Completed",
		cancelled: "Cancelled",
	};

	getStatusLabel(status: OrderStatus | undefined): string {
		return this.statusLabels[status || "pending"] || status || "Pending";
	}

	getStatusClass(status: string | undefined): string {
		const classes: Record<string, string> = {
			pending: "status-pending",
			processing: "status-processing",
			completed: "status-completed",
			cancelled: "status-cancelled",
		};
		return classes[status || "pending"] || "status-pending";
	}

	ngOnInit() {
		this.orderService
			.getAll()
			.subscribe(orders => (this.dataSource.data = orders));
	}

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
