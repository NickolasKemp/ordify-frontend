import { Component, OnDestroy, OnInit, signal } from "@angular/core";
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
import { ConfirmationDialogService } from "../../services/confirmation-dialog.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

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
		MatProgressSpinnerModule,
	],
	templateUrl: "./auth-page.component.html",
	styleUrl: "./auth-page.component.css",
})
export class AuthPageComponent implements OnInit, OnDestroy {
	isLoading = signal(false);

	readonly email = new FormControl("", [Validators.required, Validators.email]);
	readonly password = new FormControl("", [
		Validators.required,
		Validators.minLength(4),
	]);

	isRegistration = signal(false);
	toggleAuth() {
		this.isRegistration.set(!this.isRegistration());
		this.serverErrorMessage.set("");
	}

	errorMessage = signal({ email: "", password: "" });
	serverErrorMessage = signal("");

	private authSubscription!: Subscription;

	constructor(
		public authService: AuthService,
		private router: Router,
		private dialog: ConfirmationDialogService,
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
				this.isLoading.set(true);
				this.authService
					.register(credentials)
					.subscribe({
						next: () => this.OkDialog(),
						error: error => {
							if (error.status === 400)
								return this.serverErrorMessage.set(error.error.message);
						},
					})
					.add(() => this.isLoading.set(false));
			} else {
				this.isLoading.set(true);
				this.authService
					.login(credentials)
					.subscribe({
						next: () => this.router.navigate(["/products"]),
						error: error => {
							if (error.status === 400)
								return this.serverErrorMessage.set(error.error.message);
						},
					})
					.add(() => this.isLoading.set(false));
			}
		}
	}

	OkDialog() {
		this.dialog
			.confirmDialog({
				title: "Success",
				message: `Your account has been registered successfully. 
			 An activation link has been sent to ordify.auth@gmail.com. 
				You will be able to sign in once your account is activated.`,
				confirmCaption: "Ok",
				cancelCaption: "",
			})
			.subscribe();
	}
}
