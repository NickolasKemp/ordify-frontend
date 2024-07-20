import { Component } from "@angular/core";
import { LoaderService } from "../../services/loader.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AsyncPipe, NgIf } from "@angular/common";

@Component({
	selector: "app-spinner",
	standalone: true,
	imports: [MatProgressSpinnerModule, NgIf, AsyncPipe],
	templateUrl: "./spinner.component.html",
	styleUrl: "./spinner.component.css",
})
export class SpinnerComponent {
	constructor(public loader: LoaderService) {}
}
