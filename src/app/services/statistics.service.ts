import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { IStatisticsItem } from "../models/statistics.model";
import { environment } from "../../environments/environment.development";

@Injectable({
	providedIn: "root",
})
export class StatisticsService {
	constructor(private http: HttpClient) {}

	API_URL = environment.SERVER_URL;
	BASE = "statistics";

	statistics$ = new BehaviorSubject<IStatisticsItem[] | null>(null);

	getMain(): Observable<IStatisticsItem[]> {
		return this.http
			.get<IStatisticsItem[]>(`${this.API_URL}/${this.BASE}/main`)
			.pipe(tap(statistics => this.statistics$.next(statistics)));
	}
}
