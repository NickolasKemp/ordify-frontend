import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import {
	AuthResponse,
	ITokens,
	IUser,
	LogoutResponse,
} from "../models/auth.model";
import { BehaviorSubject, catchError, finalize, tap, throwError } from "rxjs";
import { Role } from "../roles";

@Injectable({
	providedIn: "root",
})
export class AuthService {
	API_URL = environment.SERVER_URL;
	BASE = "auth";

	isAuth$ = new BehaviorSubject<boolean>(false);
	isAuthStatusLoading$ = new BehaviorSubject<boolean>(false);

	constructor(private http: HttpClient) {}

	register(credentials: Pick<IUser, "email" | "password">) {
		return this.http.post<IUser>(
			`${this.API_URL}/${this.BASE}/register`,
			credentials,
		);
	}

	login(credentials: Pick<IUser, "email" | "password">) {
		return this.http
			.post<AuthResponse>(`${this.API_URL}/${this.BASE}/login`, credentials)
			.pipe(
				tap(response => {
					localStorage.setItem("accessToken", response.accessToken);
					this.isAuth$.next(true);
				}),
			);
	}

	logout() {
		return this.http
			.get<LogoutResponse>(`${this.API_URL}/${this.BASE}/logout`)
			.pipe(
				tap(() => {
					localStorage.removeItem("accessToken");
					this.isAuth$.next(false);
				}),
			);
	}

	refresh() {
		return this.http.get<ITokens>(`${this.API_URL}/${this.BASE}/refresh`).pipe(
			tap(() => {
				this.isAuth$.next(true);
			}),
			catchError(error => {
				if (error.status === 401) {
					this.isAuth$.next(false);
				}
				return throwError(() => error);
			}),
		);
	}

	checkAuth() {
		this.isAuthStatusLoading$.next(true);
		return this.refresh().pipe(
			tap(tokens => {
				localStorage.setItem("accessToken", tokens.accessToken);
			}),
			finalize(() => this.isAuthStatusLoading$.next(false)),
		);
	}

	getUserRole(): Role {
		return this.isAuth$.getValue() ? Role.USER : Role.CUSTOMER;
	}
}
