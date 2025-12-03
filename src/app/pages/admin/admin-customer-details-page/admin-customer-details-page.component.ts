import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CustomersService } from "../../../services/customers.service";
import { AgreementService } from "../../../services/agreement.service";
import { ICustomer } from "../../../models/customer.model";
import { IAgreement } from "../../../models/agreement.model";
import { CommonModule, DatePipe, NgIf } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";

@Component({
	selector: "app-admin-customer-details-page",
	standalone: true,
	imports: [
		CommonModule,
		NgIf,
		DatePipe,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatDividerModule,
		MatChipsModule,
		RouterLink,
	],
	templateUrl: "./admin-customer-details-page.component.html",
	styleUrl: "./admin-customer-details-page.component.css",
})
export class AdminCustomerDetailsPageComponent implements OnInit {
	customer = signal<ICustomer | null>(null);
	agreement = signal<IAgreement | null>(null);
	isLoading = signal(true);
	error = signal<string | null>(null);

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private customersService: CustomersService,
		private agreementService: AgreementService,
	) {}

	ngOnInit() {
		const customerId = this.route.snapshot.paramMap.get("id");
		if (customerId) {
			this.loadCustomerData(customerId);
		}
	}

	private loadCustomerData(customerId: string) {
		this.isLoading.set(true);

		// Load customer
		this.customersService.getById(customerId).subscribe({
			next: customer => {
				this.customer.set(customer);
				// Load agreement for this customer
				this.loadAgreement(customerId);
			},
			error: () => {
				this.error.set("Customer not found");
				this.isLoading.set(false);
			},
		});
	}

	private loadAgreement(customerId: string) {
		this.agreementService.getByCustomer(customerId).subscribe({
			next: agreement => {
				this.agreement.set(agreement);
				this.isLoading.set(false);
			},
			error: () => {
				// No agreement found - this is ok
				this.isLoading.set(false);
			},
		});
	}

	goBack() {
		this.router.navigate(["/admin/customers"]);
	}

	isAgreementActive(): boolean {
		const agreement = this.agreement();
		if (!agreement) return false;
		return agreement.isActive && new Date(agreement.ends_at) > new Date();
	}
}
