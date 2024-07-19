import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, switchMap, tap } from "rxjs";
import { ICustomer } from "../models/customer.model";
import { environment } from "../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class CustomersService {
	constructor(private http: HttpClient) {}

	API_URL = environment.SERVER_URL;
	BASE = "customers";

	customers$: BehaviorSubject<ICustomer[] | null> = new BehaviorSubject<
		ICustomer[] | null
	>(null);

	customerById$: BehaviorSubject<ICustomer | null> =
		new BehaviorSubject<ICustomer | null>(null);

	getAll(): Observable<ICustomer[]> {
		return this.http
			.get<ICustomer[]>(`${this.API_URL}/${this.BASE}`)
			.pipe(tap(customers => this.customers$.next(customers)));
	}

	getById(id: string): Observable<ICustomer> {
		return this.http
			.get<ICustomer>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(tap(prod => this.customerById$.next(prod)));
	}

	create(customer: Omit<ICustomer, "id" | "createdAt">): Observable<ICustomer> {
		return this.http
			.post<ICustomer>(`${this.API_URL}/${this.BASE}`, customer)
			.pipe(switchMap(customer => this.getAll().pipe(map(() => customer))));
	}

	delete(id: string): Observable<ICustomer> {
		return this.http
			.delete<ICustomer>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}
}
