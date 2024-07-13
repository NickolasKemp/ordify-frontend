import { CanActivateFn, Router } from "@angular/router";
import { Role } from "./roles";
import { inject } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { first, of, switchMap } from "rxjs";

export const hasRoleGuard: CanActivateFn = route => {
	const router: Router = inject(Router);
	const authService: AuthService = inject(AuthService);

	return authService.isAuthStatusLoading$.pipe(
		first(isLoading => !isLoading),
		switchMap(() => {
			const userRole: Role = authService.getUserRole();
			const expectedRoles: Role[] = route.data["roles"];

			const hasRole: boolean = expectedRoles.some(role => userRole === role);

			if (hasRole) {
				return of(true);
			} else {
				router.navigate(["products"]);
				return of(false);
			}
		}),
	);
};
