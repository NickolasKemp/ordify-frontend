import { Component } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { BurgerMenuComponent } from "../burger-menu/burger-menu.component";
import { ProductSearchComponent } from "../product-search/product-search.component";

@Component({
	selector: "app-header",
	standalone: true,
	imports: [
		MatIconModule,
		AsyncPipe,
		BurgerMenuComponent,
		ProductSearchComponent,
	],
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.css",
})
export class HeaderComponent {
	constructor(
		public authService: AuthService,
		public router: Router,
	) {}
}
