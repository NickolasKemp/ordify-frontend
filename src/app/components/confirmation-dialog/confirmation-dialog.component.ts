import { NgIf } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";

export interface ConfirmDialogData {
	title: string;
	message: string;
	confirmCaption: string;
	cancelCaption: string;
}

@Component({
	selector: "app-confirmation-dialog",
	standalone: true,
	imports: [
		MatIconModule,
		MatButtonModule,
		MatToolbarModule,
		MatDialogModule,
		NgIf,
	],
	templateUrl: "./confirmation-dialog.component.html",
	styleUrl: "./confirmation-dialog.component.css",
})
export class ConfirmationDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
