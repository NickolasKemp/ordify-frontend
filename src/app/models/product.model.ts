export interface IProduct {
	_id: string;
	createdAt: Date;
	name: string;
	description?: string;
	price: number;
	images: string[];
	deliveryWay: EnumDeliveryWay;
	deliveryPrice?: number;
	deliveryPeriod?: string;
	quantity: number;
}

export enum EnumDeliveryWay {
	COURIER = "COURIER",
	POSTAL = "POSTAL",
	PICKUP = "PICKUP",
}
