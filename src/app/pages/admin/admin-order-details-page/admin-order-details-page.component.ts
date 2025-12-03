import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrdersService } from "../../../services/orders.service";
import {
	AsyncPipe,
	CurrencyPipe,
	DatePipe,
	NgIf,
	NgFor,
	NgClass,
} from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ConfirmationDialogService } from "../../../services/confirmation-dialog.service";
import { PdfService } from "../../../services/pdf.service";
import { OrderStatus } from "../../../models/order.model";

@Component({
	selector: "app-admin-order-details-page",
	standalone: true,
	imports: [
		NgIf,
		NgFor,
		NgClass,
		AsyncPipe,
		DatePipe,
		CurrencyPipe,
		MatButtonModule,
		MatIconModule,
		MatSelectModule,
		MatFormFieldModule,
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

	order$ = this.orderService.orderById$;
	isUpdating = signal(false);

	orderStatuses: { value: OrderStatus; label: string }[] = [
		{ value: "pending", label: "Pending" },
		{ value: "processing", label: "Processing" },
		{ value: "completed", label: "Completed" },
		{ value: "cancelled", label: "Cancelled" },
	];

	ngOnInit(): void {
		const orderId = this.route.snapshot.paramMap.get("id")!;
		this.orderService.getById(orderId).subscribe();
	}

	onStatusChange(orderId: string, newStatus: OrderStatus) {
		this.dialog
			.confirmDialog({
				title: "Confirm Status Change",
				message: `Are you sure you want to change order status to "${this.getStatusLabel(newStatus)}"?`,
				confirmCaption: "Confirm",
				cancelCaption: "Cancel",
			})
			.subscribe(confirmed => {
				if (confirmed) {
					this.isUpdating.set(true);
					this.orderService.updateStatus(orderId, newStatus).subscribe({
						next: () => this.isUpdating.set(false),
						error: () => this.isUpdating.set(false),
					});
				}
			});
	}

	completeOrder(orderId: string) {
		this.onStatusChange(orderId, "completed");
	}

	getStatusLabel(status: OrderStatus | undefined): string {
		return (
			this.orderStatuses.find(s => s.value === status)?.label ||
			status ||
			"Pending"
		);
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
