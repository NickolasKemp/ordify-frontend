import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { OrdersService } from "../../services/orders.service";
import { IOrder } from "../../models/order.model";

@Component({
	selector: "app-payment-page",
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		CurrencyPipe,
		DatePipe,
	],
	templateUrl: "./payment-page.component.html",
	styleUrl: "./payment-page.component.css",
})
export class PaymentPageComponent implements OnInit {
	order = signal<IOrder | null>(null);
	isLoading = signal(true);
	error = signal<string | null>(null);

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private ordersService: OrdersService,
	) {}

	ngOnInit() {
		const orderId = this.route.snapshot.queryParamMap.get("orderId");

		if (orderId) {
			this.ordersService.getById(orderId).subscribe({
				next: order => {
					this.order.set(order);
					this.isLoading.set(false);
				},
				error: () => {
					this.error.set("Failed to load order details");
					this.isLoading.set(false);
				},
			});
		} else {
			// Якщо немає orderId, показуємо загальне повідомлення про успіх
			this.isLoading.set(false);
		}
	}

	goToProducts() {
		this.router.navigate(["/products"]);
	}

	getDeliveryLabel(deliveryWay: string): string {
		const labels: Record<string, string> = {
			COURIER: "Courier Delivery",
			POSTAL: "Postal Service",
			PICKUP: "Self Pickup",
		};
		return labels[deliveryWay] || deliveryWay;
	}

	getPaymentStatusLabel(status: string | undefined): string {
		const labels: Record<string, string> = {
			pending: "Pending",
			paid: "Paid",
			failed: "Failed",
		};
		return labels[status || "pending"] || status || "Pending";
	}

	getPaymentStatusClass(status: string | undefined): string {
		const classes: Record<string, string> = {
			pending: "status-pending",
			paid: "status-paid",
			failed: "status-failed",
		};
		return classes[status || "pending"] || "status-pending";
	}
}
