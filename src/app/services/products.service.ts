import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, switchMap, tap } from "rxjs";
import { IProduct } from "../models/product.model";
import { environment } from "../../environments/environment.development";

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

	getAll(): Observable<IProduct[]> {
		return this.http
			.get<IProduct[]>(`${this.API_URL}/${this.BASE}`)
			.pipe(tap(products => this.products$.next(products)));
	}

	getById(id: string): Observable<IProduct> {
		return this.http
			.get<IProduct>(`${this.API_URL}/${this.BASE}/${id}`)
			.pipe(tap(prod => this.productById$.next(prod)));
	}

	create(product: Omit<IProduct, "id">): Observable<IProduct> {
		return this.http
			.post<IProduct>(`${this.API_URL}/${this.BASE}`, product)
			.pipe(switchMap(product => this.getAll().pipe(map(() => product))));
	}
}
