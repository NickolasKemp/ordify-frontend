import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import {
	IAgreement,
	ITokenValidationResponse,
} from "../models/agreement.model";
import { environment } from "../../environments/environment";

const CLIENT_TOKEN_KEY = "ordify_client_token";

@Injectable({
	providedIn: "root",
})
export class AgreementService {
	constructor(private http: HttpClient) {
		// Load token from localStorage on service init
		this.loadStoredToken();
	}

	API_URL = environment.SERVER_URL;
	BASE = "agreements";

	agreements$: BehaviorSubject<IAgreement[] | null> = new BehaviorSubject<
		IAgreement[] | null
	>(null);

	currentAgreement$: BehaviorSubject<IAgreement | null> =
		new BehaviorSubject<IAgreement | null>(null);

	clientToken$: BehaviorSubject<string | null> = new BehaviorSubject<
		string | null
	>(null);

	/**
	 * Load stored client token from localStorage
	 */
	private loadStoredToken(): void {
		const storedToken = localStorage.getItem(CLIENT_TOKEN_KEY);
		if (storedToken) {
			this.clientToken$.next(storedToken);
		}
	}

	/**
	 * Save client token to localStorage and BehaviorSubject
	 */
	saveClientToken(token: string): void {
		localStorage.setItem(CLIENT_TOKEN_KEY, token);
		this.clientToken$.next(token);
	}

	/**
	 * Get currently stored client token
	 */
	getClientToken(): string | null {
		return this.clientToken$.getValue();
	}

	/**
	 * Clear client token (for logout or when agreement expires)
	 */
	clearClientToken(): void {
		localStorage.removeItem(CLIENT_TOKEN_KEY);
		this.clientToken$.next(null);
		this.currentAgreement$.next(null);
	}

	/**
	 * Check if client has a valid token stored
	 */
	hasClientToken(): boolean {
		return !!this.getClientToken();
	}

	/**
	 * Get all agreements (admin)
	 */
	getAll(): Observable<IAgreement[]> {
		return this.http
			.get<IAgreement[]>(`${this.API_URL}/${this.BASE}`)
			.pipe(tap(agreements => this.agreements$.next(agreements)));
	}

	/**
	 * Get agreement by ID
	 */
	getById(id: string): Observable<IAgreement> {
		return this.http.get<IAgreement>(`${this.API_URL}/${this.BASE}/${id}`);
	}

	/**
	 * Get active agreement for a customer
	 */
	getByCustomer(customerId: string): Observable<IAgreement> {
		return this.http.get<IAgreement>(
			`${this.API_URL}/${this.BASE}/customer/${customerId}`,
		);
	}

	/**
	 * Validate client token and get agreement info
	 */
	validateToken(token: string): Observable<ITokenValidationResponse> {
		return this.http
			.get<ITokenValidationResponse>(
				`${this.API_URL}/${this.BASE}/validate/${token}`,
			)
			.pipe(
				tap(response => {
					if (response.valid) {
						this.currentAgreement$.next(response.agreement);
					}
				}),
			);
	}

	/**
	 * Validate stored client token
	 */
	validateStoredToken(): Observable<ITokenValidationResponse> | null {
		const token = this.getClientToken();
		if (!token) {
			return null;
		}
		return this.validateToken(token);
	}

	/**
	 * Create new agreement for a customer
	 */
	create(
		customerId: string,
		agreementData?: { ends_at?: Date; legalEntity?: string },
	): Observable<IAgreement> {
		return this.http.post<IAgreement>(
			`${this.API_URL}/${this.BASE}/${customerId}`,
			agreementData || {},
		);
	}

	/**
	 * Deactivate an agreement
	 */
	deactivate(agreementId: string): Observable<IAgreement> {
		return this.http.patch<IAgreement>(
			`${this.API_URL}/${this.BASE}/${agreementId}/deactivate`,
			{},
		);
	}

	/**
	 * Renew an agreement
	 */
	renew(agreementId: string, ends_at?: Date): Observable<IAgreement> {
		return this.http.patch<IAgreement>(
			`${this.API_URL}/${this.BASE}/${agreementId}/renew`,
			{ ends_at },
		);
	}

	/**
	 * Get HTTP headers with client token for authenticated requests
	 */
	getTokenHeaders(): HttpHeaders {
		const token = this.getClientToken();
		if (token) {
			return new HttpHeaders().set("x-client-token", token);
		}
		return new HttpHeaders();
	}
}
