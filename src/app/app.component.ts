import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatBadgeModule } from "@angular/material/badge";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { HeaderComponent } from "./components/header/header.component";
import { PageWrapperComponent } from "./components/page-wrapper/page-wrapper.component";
import { AuthService } from "./services/auth.service";
import { catchError, of } from "rxjs";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [
		RouterOutlet,
		MatSlideToggleModule,
		MatButtonModule,
		MatIconModule,
		MatBadgeModule,
		MatSliderModule,
		HeaderComponent,
		PageWrapperComponent,
	],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
	constructor(private authService: AuthService) {}
	ngOnInit() {
		if (localStorage.getItem("accessToken")) {
			this.authService
				.checkAuth()
				.pipe(
					catchError(error => {
						console.log(error);
						return of(null);
					}),
				)
				.subscribe();
		}
	}

	title = "ordify-frontend";
}
