import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, switchMap, tap } from "rxjs";
import { IOrder, OrderStatus } from "../models/order.model";
import { environment } from "../../environments/environment";
import { IAgreementCreateResponse } from "../models/agreement.model";

@Injectable({
	providedIn: "root",
})
export class OrdersService {
	constructor(private http: HttpClient) {}

	API_URL = environment.SERVER_URL;
	BASE = "orders";

	orders$: BehaviorSubject<IOrder[] | null> = new BehaviorSubject<
		IOrder[] | null
	>(null);

	orderById$: BehaviorSubject<IOrder | null> =
		new BehaviorSubject<IOrder | null>(null);

	getAll(): Observable<IOrder[]> {
		return this.http
			.get<IOrder[]>(`${this.API_URL}/${this.BASE}`)
			.pipe(tap(orders => this.orders$.next(orders)));
	}

	getById(id: string): Observable<IOrder> {
		return this.http
			.get<IOrder>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(tap(prod => this.orderById$.next(prod)));
	}

	/**
	 * Legacy create method (without agreement)
	 */
	create(
		order: Omit<IOrder, "_id" | "createdAt" | "product" | "customer">,
		customerId: string,
		productId: string,
	): Observable<IOrder> {
		return this.http
			.post<IOrder>(
				`${this.API_URL}/${this.BASE}/${customerId}/${productId}`,
				order,
			)
			.pipe(switchMap(order => this.getAll().pipe(map(() => order))));
	}

	/**
	 * Create first order with agreement - returns client token for future orders
	 */
	createWithAgreement(
		order: Omit<IOrder, "_id" | "createdAt" | "product" | "customer">,
		customerId: string,
		productId: string,
		agreementData?: { ends_at?: Date; legalEntity?: string },
	): Observable<IAgreementCreateResponse> {
		return this.http
			.post<IAgreementCreateResponse>(
				`${this.API_URL}/${this.BASE}/agreement/${customerId}/${productId}`,
				{ order, agreementData },
			)
			.pipe(switchMap(response => this.getAll().pipe(map(() => response))));
	}

	/**
	 * Create order using client token (for returning customers)
	 */
	createWithToken(
		order: Omit<IOrder, "_id" | "createdAt" | "product" | "customer">,
		productId: string,
		clientToken: string,
	): Observable<IOrder> {
		const headers = new HttpHeaders().set("x-client-token", clientToken);
		return this.http
			.post<IOrder>(`${this.API_URL}/${this.BASE}/token/${productId}`, order, {
				headers,
			})
			.pipe(switchMap(order => this.getAll().pipe(map(() => order))));
	}

	update(id: string, order: Partial<IOrder>): Observable<IOrder> {
		return this.http
			.put<IOrder>(`${this.API_URL}/${this.BASE}/${id}`, order)
			.pipe(
				tap(updatedOrder => {
					this.orderById$.next(updatedOrder);
				}),
				switchMap(updatedOrder => this.getAll().pipe(map(() => updatedOrder))),
			);
	}

	updateStatus(id: string, status: OrderStatus): Observable<IOrder> {
		return this.update(id, { status });
	}

	delete(id: string): Observable<IOrder> {
		return this.http
			.delete<IOrder>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(switchMap(order => this.getAll().pipe(map(() => order))));
	}
}
