import { Injectable } from "@angular/core";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { IOrder } from "../models/order.model";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
	providedIn: "root",
})
export class PdfService {
	generateOrderPdf(order: IOrder) {
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

		pdfMake
			.createPdf(docDefinition)
			.download(`${order.customer.name}_Order_Details.pdf`);
	}
}
