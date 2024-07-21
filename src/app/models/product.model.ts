export interface IProduct {
	_id: string;
	createdAt: Date;
	name: string;
	description?: string;
	price: number;
	image: string;
	deliveryOptions: [IDeliveryOption];
	quantity: number;
}

export interface IDeliveryOption {
	type: EnumDeliveryWay;
	price: number;
	period: string;
}

export enum EnumDeliveryWay {
	COURIER = "COURIER",
	POSTAL = "POSTAL",
	PICKUP = "PICKUP",
}

export interface IProductResponse {
	products: IProduct[];
	totalPages: number;
	totalProducts: number;
}

export class Product implements Partial<IProduct> {
	constructor(
		public name = "",
		public description = "",
		public price = 0,
		public image = "",
		public deliveryOptions: [IDeliveryOption] = [new DeliveryOption()],
		public quantity = 1,
		public deliveryPrice = 0,
		public deliveryPeriod = "",
	) {}
}

export class DeliveryOption implements IDeliveryOption {
	constructor(
		public type = EnumDeliveryWay.PICKUP,
		public period = "immediate",
		public price = 0,
	) {
		this.type = type;
		this.period = period;
		this.price = price;
	}
}
