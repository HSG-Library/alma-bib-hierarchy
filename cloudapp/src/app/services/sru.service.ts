import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { EMPTY, Observable, of } from 'rxjs'
import { expand, map, reduce, switchMap, tap } from 'rxjs/operators'
import { SruQuery } from '../sru/sru-query'
import { LoadingIndicatorService } from './loading-indicator.service'
import { LogService } from './log.service'
import { SruResponseParserService } from './sru-response-parsers.service'


@Injectable({
	providedIn: 'root'
})
export class SruService {

	private static ALMA_DOMAIN: string = 'https://eu03.alma.exlibrisgroup.com'
	private static SRU_PATH: string = '/view/sru/'
	private static NETWORK_CODE: string = '41SLSP_NETWORK'

	private params: HttpParams

	constructor(
		private parser: SruResponseParserService,
		private log: LogService,
		private loader: LoadingIndicatorService,
		private httpClient: HttpClient) {
		this.params = new HttpParams()
			.set('version', '1.2')
			.set('operation', 'searchRetrieve')
			.set('recordSchema', 'marcxml')
	}

	private getNzUrl() {
		return SruService.ALMA_DOMAIN + SruService.SRU_PATH + SruService.NETWORK_CODE
	}

	private getParams(query: SruQuery, startRecord: number, maximumRecords: number) {
		return this.params
			.set(SruQuery.QUERY, query.get())
			.set('startRecord', String(startRecord))
			.set('maximumRecords', String(maximumRecords))
	}

	querNZRecordCount(query: SruQuery): Observable<number> {
		const url: string = this.getNzUrl()
		return this.call(url, query, 1, 0)
			.pipe(
				switchMap(response => of(this.parser.getNumberOfRecords(response)))
			)
	}

	queryNZ(query: SruQuery): Observable<Element[]> {
		const url: string = this.getNzUrl()
		return this.call(url, query).pipe(
			tap(response => this.log.info('Number of records: ', this.parser.getNumberOfRecords(response))),
			expand(response => {
				this.loader.hasProgress(true)
				const total: number = this.parser.getNumberOfRecords(response)
				const next: number = this.parser.getNextRecordPosition(response)
				this.loader.setProgress(Math.round((next / total) * 100))
				if (next > 0) {
					return this.call(url, query, next)
				}
				return EMPTY
			}),
			map((response) => {
				const result: Element[] = this.parser.getRecords(response)
				return result
			}),
			tap(() => this.loader.hasProgress(false)),
			reduce((accData, data) => accData.concat(data), [])
		)
	}

	private call(url: string, query: SruQuery, startRecord: number = 1, maximumRecords: number = 50): Observable<string> {
		const params: HttpParams = this.getParams(query, startRecord, maximumRecords)
		this.log.info('SRU Query URL: ', url + '?' + params.toString())
		return this.httpClient.get(url, {
			responseType: 'text',
			params: params
		})
	}
}
