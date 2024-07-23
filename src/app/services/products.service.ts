import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, switchMap, tap } from "rxjs";
import {
	IDeliveryOption,
	IProduct,
	IProductResponse,
} from "../models/product.model";
import { environment } from "../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class ProductsService {
	constructor(private http: HttpClient) {}

	API_URL = environment.SERVER_URL;
	BASE = "products";

	products$: BehaviorSubject<IProduct[] | null> = new BehaviorSubject<
		IProduct[] | null
	>(null);

	productById$: BehaviorSubject<IProduct | null> =
		new BehaviorSubject<IProduct | null>(null);

	pagination = new BehaviorSubject<{ page: number; pageSize: number }>({
		page: 0,
		pageSize: 10,
	});
	searchTerm = new BehaviorSubject<string>("");

	getAll(
		searchTerm = this.searchTerm.getValue(),
		page = this.pagination.getValue().page,
		pageSize = this.pagination.getValue().pageSize,
	): Observable<IProductResponse> {
		let params = new HttpParams();
		if (searchTerm) {
			params = params.set("searchTerm", searchTerm);
		}

		if (page !== undefined && pageSize !== undefined) {
			params = params.set("page", page);
			params = params.set("pageSize", pageSize);
		}

		return this.http
			.get<IProductResponse>(`${this.API_URL}/${this.BASE}`, { params })
			.pipe(tap(response => this.products$.next(response.products)));
	}

	getById(id: string): Observable<IProduct> {
		return this.http
			.get<IProduct>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(tap(prod => this.productById$.next(prod)));
	}

	create(product: Omit<IProduct, "_id" | "createdAt">): Observable<IProduct> {
		return this.http
			.post<IProduct>(`${this.API_URL}/${this.BASE}`, product)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}

	update(id: string, product: Partial<IProduct>): Observable<IProduct> {
		return this.http
			.put<IProduct>(`${this.API_URL}/${this.BASE}/${id}`, product)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}

	addDeliveryOption(
		id: string,
		deliveryOption: IDeliveryOption,
	): Observable<IProduct> {
		return this.http
			.patch<IProduct>(
				`${this.API_URL}/${this.BASE}/${id}/delivery-options`,
				deliveryOption,
			)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}

	deleteDeliveryOption(
		productId: string,
		deliveryOptionId: string,
	): Observable<IProduct> {
		return this.http
			.patch<IProduct>(
				`${this.API_URL}/${this.BASE}/${productId}/delivery-options/${deliveryOptionId}`,
				{},
			)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}

	delete(id: string): Observable<IProduct> {
		return this.http
			.delete<IProduct>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}
}
