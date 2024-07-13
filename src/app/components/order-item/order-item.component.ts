import { Component, Input } from "@angular/core";
import { IOrder } from "../../models/order.model";
import { DatePipe, NgIf } from "@angular/common";

@Component({
	selector: "app-order-item",
	standalone: true,
	imports: [NgIf, DatePipe],
	templateUrl: "./order-item.component.html",
	styleUrl: "./order-item.component.css",
})
export class OrderItemComponent {
	@Input() order: IOrder | undefined;
	@Input() index: number | undefined;
}
