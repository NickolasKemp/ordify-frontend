import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { LoaderService } from "../services/loader.service";
import { finalize } from "rxjs";

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
	const loader = inject(LoaderService);

	const shouldSkipLoader = req.url.includes("auth");
	if (!shouldSkipLoader) {
		loader.showLoader();
	}
	return next(req).pipe(
		finalize(() => {
			if (!shouldSkipLoader) {
				loader.hideLoader();
			}
		}),
	);
};
