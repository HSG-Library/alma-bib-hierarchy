import { Component, Input, ViewChild } from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { BibInfo } from '../models/bib-info.model'

@Component({
	selector: 'app-result-table',
	templateUrl: './result-table.component.html',
	styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent {

	displayedColumns: string[] = ['order', 'title', 'year', 'edition', 'mmsId', 'holdings'];

	@Input()
	result: MatTableDataSource<BibInfo>

	@ViewChild(MatSort) sort: MatSort

	getMatSort() {
		return this.sort
	}
}
