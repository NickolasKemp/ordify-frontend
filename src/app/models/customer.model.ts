export interface ICustomer {
	_id: string;
	name: string;
	street: string;
	city: string;
	state: string;
	code: number;
	phone: string;
	contactPerson?: string;
}
