import { NgClass } from "@angular/common";
import { Component, signal } from "@angular/core";
import { ClickedOutsideDirective } from "../../directives/click-outside.directive";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
	selector: "app-burger-menu",
	standalone: true,
	imports: [
		NgClass,
		ClickedOutsideDirective,
		MatIconModule,
		RouterLinkActive,
		RouterLink,
	],
	templateUrl: "./burger-menu.component.html",
	styleUrl: "./burger-menu.component.css",
})
export class BurgerMenuComponent {
	showMenu = signal(false);

	toggleMenu() {
		this.showMenu.set(!this.showMenu());
	}

	hideMenu() {
		this.showMenu.set(false);
	}
}
