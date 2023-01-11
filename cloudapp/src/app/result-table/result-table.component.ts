import { Component, Input, ViewChild } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib'
import { BibInfo } from '../models/bib-info.model'

@Component({
	selector: 'app-result-table',
	templateUrl: './result-table.component.html',
	styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent {
	displayedColumns: string[] = ['order', 'title', 'year', 'edition', 'mmsId', 'duplicate', 'analytical', 'holdings'];
	instCode: string

	@Input()
	result: MatTableDataSource<BibInfo>

	@ViewChild(MatSort) sort: MatSort

	constructor(
		private events: CloudAppEventsService
	) {
		this.events.getInitData().subscribe(data => this.instCode = data.instCode)
	}

	getMatSort() {
		return this.sort
	}

	shortHolding(holding: string): string {
		return holding.replace(/^.+_/, '')
	}
}
