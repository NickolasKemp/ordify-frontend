import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {
	ConfirmationDialogComponent,
	ConfirmDialogData,
} from "../components/confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class ConfirmationDialogService {
	constructor(private dialog: MatDialog) {}

	confirmDialog(data: ConfirmDialogData): Observable<boolean> {
		return this.dialog
			.open(ConfirmationDialogComponent, {
				data,
				width: "400px",
				disableClose: true,
			})
			.afterClosed();
	}
}
