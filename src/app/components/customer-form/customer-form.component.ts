import { NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
	selector: "app-customer-form",
	standalone: true,
	imports: [
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatIcon,
		ReactiveFormsModule,
		NgIf,
	],
	templateUrl: "./customer-form.component.html",
	styleUrl: "./customer-form.component.css",
})
export class CustomerFormComponent {
	@Input() formGroup: FormGroup | undefined;
	@Input() errorMessages: Record<string, string> | undefined;
}
