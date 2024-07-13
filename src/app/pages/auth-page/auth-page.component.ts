import {
	Component,
	OnChanges,
	OnInit,
	signal,
	SimpleChanges,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	FormControl,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { merge, Subscription } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-auth-page",
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		MatIconModule,
		MatButtonModule,
		CommonModule,
	],
	templateUrl: "./auth-page.component.html",
	styleUrl: "./auth-page.component.css",
})
export class AuthPageComponent implements OnInit {
	constructor(
		public authService: AuthService,
		private router: Router,
	) {
		merge(
			this.email.statusChanges,
			this.email.valueChanges,
			this.password.statusChanges,
			this.password.valueChanges,
		)
			.pipe(takeUntilDestroyed())
			.subscribe(() => this.updateErrorMessage());
	}
	private authSubscription!: Subscription;

	ngOnInit(): void {
		this.authSubscription = this.authService.isAuth$.subscribe(isAuth => {
			if (isAuth) {
				this.router.navigate([""]);
			}
		});
	}

	ngOnDestroy(): void {
		if (this.authSubscription) {
			this.authSubscription.unsubscribe();
		}
	}

	isLoading = signal(false);

	readonly email = new FormControl("", [Validators.required, Validators.email]);
	readonly password = new FormControl("", [
		Validators.required,
		Validators.minLength(4),
	]);

	isRegistration = signal(true);
	toggleAuth() {
		this.isRegistration.set(!this.isRegistration());
		this.serverErrorMessage.set("");
	}

	errorMessage = signal({ email: "", password: "" });
	serverErrorMessage = signal("");

	consoleInput() {
		if (this.email.errors || this.password.errors) {
			console.log(this.email.errors);
			console.log(this.password.errors);
			return;
		}
		console.log({
			email: this.email.getRawValue(),
			pass: this.password.getRawValue(),
		});
	}

	updateErrorMessage() {
		if (this.email.hasError("required")) {
			this.errorMessage.set({
				...this.errorMessage(),
				email: "You must enter a value",
			});
		} else if (this.email.hasError("email")) {
			this.errorMessage.set({
				...this.errorMessage(),
				email: "Not a valid email",
			});
		} else if (this.password.hasError("minlength")) {
			this.errorMessage.set({
				...this.errorMessage(),
				password: `Min length ${this.password.getError("minlength").requiredLength}`,
			});
		} else {
			this.errorMessage.set({ email: "", password: "" });
		}
	}

	hide = signal(true);
	clickEvent(event: MouseEvent) {
		this.hide.set(!this.hide());
		event.stopPropagation();
	}

	login() {
		if (this.email.errors || this.password.errors) {
			return;
		}

		const email = this.email.getRawValue();
		const password = this.password.getRawValue();
		if (email && password) {
			const credentials = {
				email,
				password,
			};
			if (this.isRegistration()) {
			} else {
				this.isLoading.set(true);
				this.authService
					.login(credentials)
					.subscribe(
						() => this.router.navigate(["/products"]),
						error => {
							if (error.status === 400)
								return this.serverErrorMessage.set(
									"Incorrect email or password",
								);
						},
					)
					.add(() => this.isLoading.set(false));
			}
		}
	}
}
