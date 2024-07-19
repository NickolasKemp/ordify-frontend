import { AsyncPipe, CurrencyPipe, NgFor } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { StatisticsService } from "../../services/statistics.service";

@Component({
	selector: "app-admin-dashboard-page",
	standalone: true,
	imports: [NgFor, CurrencyPipe, AsyncPipe],
	templateUrl: "./admin-dashboard-page.component.html",
	styleUrl: "./admin-dashboard-page.component.css",
})
export class AdminDashboardPageComponent implements OnInit {
	constructor(private statisticsService: StatisticsService) {}

	ngOnInit(): void {
		this.statisticsService.getMain().subscribe();
	}

	statistics$ = this.statisticsService.statistics$!;
}
