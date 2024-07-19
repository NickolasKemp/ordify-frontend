import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrdersService } from "../../../services/orders.service";
import { AsyncPipe, CurrencyPipe, DatePipe, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ConfirmationDialogService } from "../../../services/confirmation-dialog.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { IOrder } from "../../../models/order.model";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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

	generatePdf(order: IOrder) {
		const docDefinition = {
			content: [
				{ text: "Order Details", style: "header" },
				{
					style: "section",
					table: {
						widths: ["auto", "*"],
						body: [
							[
								{ text: "Date", style: "label" },
								{
									text: new Date(order.created_at).toLocaleDateString(),
									style: "value",
								},
							],
							[
								{ text: "Delivery", style: "label" },
								{ text: order.deliveryWay, style: "value" },
							],
							[
								{ text: "Total", style: "label" },
								{ text: `$${order.price}`, style: "value" },
							],
						],
					},
					layout: "noBorders",
				},
				{ text: "Customer Details", style: "subheader" },
				{
					style: "section",
					table: {
						widths: ["*"],
						body: [
							[{ text: order.customer.name, style: "value" }],
							[{ text: order.customer.contactPerson, style: "value" }],
							[
								{
									text: `${order.customer.street}, ${order.customer.city}, ${order.customer.state}, ${order.customer.zip}`,
									style: "value",
								},
							],
						],
					},
					layout: "noBorders",
				},
				{ text: "Product Details", style: "subheader" },
				{
					style: "section",
					table: {
						widths: ["auto", "*"],
						body: [
							[
								{ text: "Product", style: "label" },
								{ text: order.product.name, style: "value" },
							],
							[
								{ text: "Quantity", style: "label" },
								{ text: order.quantity, style: "value" },
							],
						],
					},
					layout: "noBorders",
				},
			],
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					margin: [0, 0, 0, 10] as [number, number, number, number],
				},
				subheader: {
					fontSize: 15,
					bold: true,
					margin: [0, 10, 0, 5] as [number, number, number, number],
				},
				section: {
					margin: [0, 10, 0, 10] as [number, number, number, number],
				},
				label: {
					bold: true,
					margin: [0, 5, 0, 5] as [number, number, number, number],
				},
				value: {
					margin: [0, 5, 0, 5] as [number, number, number, number],
				},
			},
		};

		pdfMake.createPdf(docDefinition).download("Order_Details.pdf");
	}
}
