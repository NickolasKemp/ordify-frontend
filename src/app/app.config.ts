import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptors,
	withInterceptorsFromDi,
} from "@angular/common/http";
import {
	authRequestInterceptor,
	AuthResponseInterceptor,
} from "./interceptors/auth.interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";
import { loaderInterceptor } from "./interceptors/loader.interceptor";

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideAnimationsAsync(),
		provideHttpClient(
			withInterceptors([
				authRequestInterceptor,
				errorInterceptor,
				loaderInterceptor,
			]),
			withInterceptorsFromDi(),
		),

		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthResponseInterceptor,
			multi: true,
		},
	],
};
