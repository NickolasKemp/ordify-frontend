import { CurrencyPipe, DatePipe } from "@angular/common";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { CustomersService } from "../../services/customers.service";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Router } from "@angular/router";
import { ICustomer } from "../../models/customer.model";
import { ConfirmationDialogService } from "../../services/confirmation-dialog.service";
import { OrdersService } from "../../services/orders.service";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
	selector: "app-admin-customers-page",
	standalone: true,
	imports: [
		DatePipe,
		CurrencyPipe,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatInputModule,
		FormsModule,
	],
	templateUrl: "./admin-customers-page.component.html",
	styleUrl: "./admin-customers-page.component.css",
})
export class AdminCustomersPageComponent implements OnInit, AfterViewInit {
	constructor(
		private customersService: CustomersService,
		private _liveAnnouncer: LiveAnnouncer,
		private router: Router,
		private dialog: ConfirmationDialogService,
		private orderService: OrdersService,
	) {}
	ngOnInit() {
		this.customersService.getAll().subscribe();
		this.customers$.subscribe(customers => {
			this.dataSource.data = customers!;
		});
	}
	customers$ = this.customersService.customers$;
	displayedColumns: string[] = [
		"position",
		"name",
		"contactPerson",
		"address",
		"phone",
		"details",
	];

	dataSource = new MatTableDataSource<ICustomer>();

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
				case "address":
					return item.city;
				default:
					return item[property as keyof ICustomer] as string;
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

	confirmCancelDialogOnDelete(id: string) {
		this.dialog
			.confirmDialog({
				title: "Confirm Action",
				message: `Are you sure you want to delete this customer? All orders related to it will also be deleted`,
				confirmCaption: "Confirm",
				cancelCaption: "Cancel",
			})
			.subscribe(confirmed => {
				if (confirmed)
					this.customersService.delete(id).subscribe(() => {
						this.router.navigate(["admin/customers"]);
					});
			});
	}
}
