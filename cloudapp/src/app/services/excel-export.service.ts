import { Injectable } from '@angular/core'
import { utils as XLSXutils, WorkBook, writeFile } from 'xlsx'
import { BibInfo } from '../models/bib-info.model'

@Injectable({
	providedIn: 'root'
})
export class ExcelExportService {

	private readonly filePrefix: string = 'BibHierarchy-'
	private readonly fileExtention: string = '.xlsx'

	export(data: BibInfo[], fileId: string): void {
		this.createXslsFile(this.sanitizeForExport(data), fileId)
	}

	private sanitizeForExport(data: BibInfo[]): any {
		return data
			.map(entry => {
				return {
					MMSID: entry.mmsId,
					Order: entry.order,
					Title: entry.title,
					Year: entry.year,
					Edition: entry.edition,
					Holdings: entry.holdings?.join(', '),
					Dulplicates: entry.duplicates?.join(', ')
				}
			})
	}

	private createXslsFile(data: any, fileId: string): void {
		const ws = XLSXutils.json_to_sheet(data)
		const wb: WorkBook = XLSXutils.book_new()
		XLSXutils.book_append_sheet(wb, ws, 'Sheet1')
		writeFile(wb, this.createFileName(fileId))
	}

	private createFileName(fileId: string): string {
		return this.filePrefix + fileId + '-' + this.currentDate() + this.fileExtention
	}

	private currentDate(): string {
		const d = new Date()
		return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds()
	}
}
