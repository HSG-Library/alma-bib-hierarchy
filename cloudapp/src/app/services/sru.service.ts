import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { EMPTY, forkJoin, Observable, of } from 'rxjs'
import { expand, map, reduce, switchMap, tap } from 'rxjs/operators'
import { SruQuery } from '../sru/sru-query'
import { ConfigurationService } from './configuration.service'
import { LoadingIndicatorService } from './loading-indicator.service'
import { LogService } from './log.service'
import { SruResponseParserService } from './sru-response-parsers.service'
import { StatusMessageService } from './status-message.service.ts'


@Injectable({
	providedIn: 'root'
})
export class SruService {

	private static readonly SRU_PATH: string = '/view/sru/'
	private readonly MAX_RECORDS: number = 50

	private params: HttpParams

	constructor(
		private configService: ConfigurationService,
		private parser: SruResponseParserService,
		private log: LogService,
		private loader: LoadingIndicatorService,
		private status: StatusMessageService,
		private httpClient: HttpClient) {
		this.params = new HttpParams()
			.set('version', '1.2')
			.set('operation', 'searchRetrieve')
			.set('recordSchema', 'marcxml')
	}

	private getNzUrl(): Observable<string> {
		return forkJoin({
			url: this.configService.getAlmaUrl(),
			networkCode: this.configService.getNetworkCode()
		}).pipe(
			switchMap(data => of(this.buildPath(data.url, SruService.SRU_PATH, data.networkCode)))
		)
	}

	private getParams(query: SruQuery, startRecord: number, maximumRecords: number): HttpParams {
		return this.params
			.set(SruQuery.QUERY, query.get())
			.set('startRecord', String(startRecord))
			.set('maximumRecords', String(maximumRecords))
	}

	querNZRecordCount(query: SruQuery): Observable<number> {
		return this.getNzUrl()
			.pipe(
				switchMap(url => this.call(url, query, 1, 0)),
				switchMap(response => of(this.parser.getNumberOfRecords(response)))
			)
	}

	queryNZ(query: SruQuery): Observable<Element[]> {
		return this.getNzUrl().pipe(
			switchMap(url => this.call(url, query)),
			tap(response => this.log.info('Number of records: ', this.parser.getNumberOfRecords(response))),
			expand(response => {
				const total: number = this.parser.getNumberOfRecords(response)
				const next: number = this.parser.getNextRecordPosition(response)
				if (total > 1) {
					this.loader.hasProgress(true)
					this.loader.setProgress(Math.round((next / total) * 100) + 1)
					this.status.set('Calling SRU for records ' + next + ' to ' + (next + this.MAX_RECORDS - 1) + ' of ' + total)
				}
				if (next > 0) {
					return this.getNzUrl().pipe(switchMap(url => this.call(url, query, next)))
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

	private call(url: string, query: SruQuery, startRecord: number = 1, maximumRecords: number = this.MAX_RECORDS): Observable<string> {
		const params: HttpParams = this.getParams(query, startRecord, maximumRecords)
		this.log.info('SRU Query URL: ', url + '?' + params.toString())
		return this.httpClient.get(url, {
			responseType: 'text',
			params: params
		})
	}

	private buildPath(...args: string[]) {
		return args.map((part, i) => {
			if (i === 0) {
				return part.trim().replace(/[\/]*$/g, '')
			} else {
				return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
			}
		}).filter(pathParts => pathParts.length).join('/')
	}
}
