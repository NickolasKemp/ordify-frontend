import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OrdersService } from "../../../services/orders.service";
import { AsyncPipe, CurrencyPipe, DatePipe, NgIf } from "@angular/common";

@Component({
	selector: "app-admin-order-details-page",
	standalone: true,
	imports: [NgIf, AsyncPipe, DatePipe, CurrencyPipe],
	templateUrl: "./admin-order-details-page.component.html",
	styleUrl: "./admin-order-details-page.component.css",
})
export class AdminOrderDetailsPageComponent implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private orderService: OrdersService,
	) {}

	ngOnInit(): void {
		const orderId = this.route.snapshot.paramMap.get("id")!;
		this.orderService.getById(orderId).subscribe();
	}

	order$ = this.orderService.orderById$;
}
