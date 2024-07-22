import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrdersService } from "../../../services/orders.service";
import { AsyncPipe, CurrencyPipe, DatePipe, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ConfirmationDialogService } from "../../../services/confirmation-dialog.service";
import { PdfService } from "../../../services/pdf.service";

@Component({
	selector: "app-admin-order-details-page",
	standalone: true,
	imports: [
		NgIf,
		AsyncPipe,
		DatePipe,
		CurrencyPipe,
		MatButtonModule,
		MatIconModule,
	],
	templateUrl: "./admin-order-details-page.component.html",
	styleUrl: "./admin-order-details-page.component.css",
})
export class AdminOrderDetailsPageComponent implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private orderService: OrdersService,
		private dialog: ConfirmationDialogService,
		private router: Router,
		public pdf: PdfService,
	) {}

	ngOnInit(): void {
		const orderId = this.route.snapshot.paramMap.get("id")!;
		this.orderService.getById(orderId).subscribe();
	}

	order$ = this.orderService.orderById$;

	confirmCancelDialog() {
		this.dialog
			.confirmDialog({
				title: "Confirm Action",
				message: "Are you sure you want to delete order?",
				confirmCaption: "Confirm",
				cancelCaption: "Cancel",
			})
			.subscribe(confirmed => {
				if (confirmed)
					this.orderService
						.delete(this.route.snapshot.paramMap.get("id")!)
						.subscribe(() => this.router.navigate(["admin/orders"]));
			});
	}
}
