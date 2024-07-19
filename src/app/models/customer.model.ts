export interface ICustomer {
	_id: string;
	name: string;
	street: string;
	city: string;
	state: string;
	zip: number;
	phone: string;
	contactPerson?: string;
}
