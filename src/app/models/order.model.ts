import { ICustomer } from "./customer.model";
import { EnumDeliveryWay, IProduct } from "./product.model";

export interface IOrder {
	_id: string;
	created_at: Date;
	quantity: number;
	price: number;
	product: IProduct;
	customer: ICustomer;
	deliveryWay: EnumDeliveryWay;
}
