import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, switchMap, tap } from "rxjs";
import { IOrder } from "../models/order.model";
import { environment } from "../../environments/environment";

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

	create(
		order: Omit<IOrder, "id" | "createdAt" | "product" | "customer">,
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

	delete(id: string): Observable<IOrder> {
		return this.http
			.delete<IOrder>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(switchMap(order => this.getAll().pipe(map(() => order))));
	}
}
