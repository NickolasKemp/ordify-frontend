import { ICustomer } from "./customer.model";
import { EnumDeliveryWay, IProduct } from "./product.model";
import { IAgreement } from "./agreement.model";

export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface IOrder {
	_id: string;
	created_at: Date;
	quantity: number;
	price: number;
	product: IProduct;
	customer: ICustomer;
	agreement?: IAgreement;
	deliveryWay: EnumDeliveryWay;
	// Payment fields
	paymentStatus?: PaymentStatus;
	paymentIntentId?: string;
	paidAt?: Date;
	// Order status
	status?: OrderStatus;
	completedAt?: Date;
}
