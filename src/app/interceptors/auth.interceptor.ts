import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpInterceptorFn,
	HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authRequestInterceptor: HttpInterceptorFn = (req, next) => {
	const accessToken = localStorage.getItem("accessToken");

	const authReq = accessToken
		? req.clone({
				withCredentials: true,
				setHeaders: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
		: req.clone({
				withCredentials: true,
			});

	return next(authReq);
};

@Injectable()
export class AuthResponseInterceptor implements HttpInterceptor {
	isRetry = false;

	constructor(private authService: AuthService) {}

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler,
	): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				if (error && error.status === 401 && !this.isRetry) {
					this.isRetry = true;
					return this.authService.refresh().pipe(
						switchMap(tokens => {
							localStorage.setItem("accessToken", tokens.accessToken);

							const clonedRequest = req.clone({
								withCredentials: true,
								setHeaders: {
									Authorization: `Bearer ${tokens.accessToken}`,
								},
							});

							this.isRetry = false;
							return next.handle(clonedRequest);
						}),
						catchError(() => {
							return throwError(() => error);
						}),
					);
				}

				return throwError(() => error);
			}),
		);
	}
}
