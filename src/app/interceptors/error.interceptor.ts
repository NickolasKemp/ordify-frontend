import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { ErrorService } from "../services/error.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
	const errorService = inject(ErrorService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			if (!(error.status === 401 || error.status === 400)) {
				errorService.handle(error.message);
			}
			return throwError(() => error);
		}),
	);
};
