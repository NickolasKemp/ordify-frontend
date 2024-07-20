import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { ErrorService } from "../services/error.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
	const errorService = inject(ErrorService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			const isAuthRequest = req.url.includes("/auth");
			if ((error.status === 400 && isAuthRequest) || error.status === 401) {
				return throwError(() => error);
			}

			errorService.handle(
				error.error.message ? error.error.message : error.message,
			);
			return throwError(() => error);
		}),
	);
};
