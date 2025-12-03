import { ICustomer } from "./customer.model";

export interface ILegalEntity {
	_id?: string;
	name: string;
	legalAddress?: {
		street?: string;
		city?: string;
		state?: string;
		zip?: string;
	};
	registrationNumber?: string;
	directorName?: string;
	bankAccount?: {
		name?: string;
		iban?: string;
	};
}

export interface IAgreement {
	_id: string;
	created_at: Date;
	ends_at: Date;
	customer: ICustomer;
	legalEntity?: ILegalEntity;
	clientToken: string;
	isActive: boolean;
}

export interface IAgreementCreateResponse {
	order: import("./order.model").IOrder;
	clientToken: string;
	message: string;
}

export interface ITokenValidationResponse {
	valid: boolean;
	agreement: IAgreement;
}

// Predefined agreement period options
export type AgreementPeriod = "3_months" | "6_months" | "1_year" | "2_years";

export interface IAgreementPeriodOption {
	value: AgreementPeriod;
	label: string;
	months: number;
}

export const AGREEMENT_PERIOD_OPTIONS: IAgreementPeriodOption[] = [
	{ value: "3_months", label: "3 Months", months: 3 },
	{ value: "6_months", label: "6 Months", months: 6 },
	{ value: "1_year", label: "1 Year", months: 12 },
	{ value: "2_years", label: "2 Years", months: 24 },
];

export interface IAgreementData {
	period: AgreementPeriod;
	legalEntity: ILegalEntity;
}
