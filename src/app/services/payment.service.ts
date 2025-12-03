import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IOrder } from "../models/order.model";

export interface PaymentIntent {
	clientSecret: string;
	paymentIntentId: string;
	amount: number;
	currency: string;
	status: string;
}

export interface CardDetails {
	cardNumber: string;
	expMonth: string;
	expYear: string;
	cvc: string;
}

export interface PaymentResult {
	success: boolean;
	paymentIntentId: string;
	status: string;
	error?: string;
	paidAt?: Date;
}

export interface PayOrderResult {
	success: boolean;
	order: IOrder;
	payment: {
		paymentIntentId: string;
		status: string;
	};
}

@Injectable({
	providedIn: "root",
})
export class PaymentService {
	private API_URL = environment.SERVER_URL;
	private BASE = "payments";

	constructor(private http: HttpClient) {}

	/**
	 * Створює Payment Intent для оплати
	 */
	createPaymentIntent(
		amount: number,
		currency = "usd",
	): Observable<PaymentIntent> {
		return this.http.post<PaymentIntent>(
			`${this.API_URL}/${this.BASE}/create-intent`,
			{ amount, currency },
		);
	}

	/**
	 * Підтверджує оплату
	 */
	confirmPayment(
		paymentIntentId: string,
		cardDetails: CardDetails,
	): Observable<PaymentResult> {
		return this.http.post<PaymentResult>(
			`${this.API_URL}/${this.BASE}/confirm`,
			{ paymentIntentId, cardDetails },
		);
	}

	/**
	 * Оплачує замовлення (створює та підтверджує платіж за один запит)
	 */
	payOrder(
		orderId: string,
		cardDetails: CardDetails,
	): Observable<PayOrderResult> {
		return this.http.post<PayOrderResult>(
			`${this.API_URL}/${this.BASE}/pay-order`,
			{ orderId, cardDetails },
		);
	}

	/**
	 * Отримує статус оплати замовлення
	 */
	getPaymentStatus(orderId: string): Observable<{
		orderId: string;
		paymentStatus: string;
		paymentIntentId?: string;
		paidAt?: Date;
	}> {
		return this.http.get<{
			orderId: string;
			paymentStatus: string;
			paymentIntentId?: string;
			paidAt?: Date;
		}>(`${this.API_URL}/${this.BASE}/status/${orderId}`);
	}
}
