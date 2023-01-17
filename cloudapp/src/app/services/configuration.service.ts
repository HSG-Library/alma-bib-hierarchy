import { Injectable } from '@angular/core'
import { CloudAppConfigService, CloudAppRestService, CloudAppSettingsService, CloudAppStoreService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Settings } from '../models/settings.model'
import { LogService } from './log.service'

@Injectable({
	providedIn: 'root'
})
export class ConfigurationService {

	private readonly ALMA_CONFIG_GENERAL: string = '/almaws/v1/conf/general'
	private readonly NETWORK: string = 'NETWORK'
	readonly NZ_URL_KEY = 'NZURL'

	constructor(
		private restService: CloudAppRestService,
		private settingsService: CloudAppSettingsService,
		private configService: CloudAppConfigService,
		private storeService: CloudAppStoreService,
		private log: LogService,
	) { }

	getAlmaUrl(): Observable<string> {
		return this.settingsService.get()
			.pipe(
				switchMap(result => {
					const settings: Settings = result as Settings
					if (settings.almaSruUrl) {
						return of(settings.almaSruUrl)
					} else {
						return this.getAlmaUrlFromConfig()
					}
				})
			)
	}

	getAlmaUrlFromConfig(): Observable<string> {
		return this.configService.get()
			.pipe(
				switchMap(result => {
					const settings: Settings = result as Settings
					if (settings.almaSruUrl) {
						return of(settings.almaSruUrl)
					} else {
						return this.getAlmaUrlFromApi()
					}
				})
			)
	}

	getAlmaUrlFromApi(): Observable<string> {
		return this.restService.call({
			method: HttpMethod.GET,
			url: this.ALMA_CONFIG_GENERAL,
		}).pipe(
			switchMap(response => {
				const almaUrl: string = response.alma_url
				return of(almaUrl)
			})
		)
	}

	getNetworkCode(): Observable<string> {
		return this.settingsService.get()
			.pipe(
				switchMap(result => {
					const settings: Settings = result as Settings
					if (settings.networkCode) {
						return of(settings.networkCode)
					} else {
						return this.getNetworkCodeFromConfig()
					}
				})
			)
	}

	getNetworkCodeFromConfig(): Observable<string> {
		return this.configService.get()
			.pipe(
				switchMap(result => {
					const settings: Settings = result as Settings
					if (settings.networkCode) {
						return of(settings.networkCode)
					} else {
						return this.getNetworkCodeFromApi()
					}
				})
			)
	}

	getNetworkCodeFromApi(): Observable<string> {
		return this.restService.call({
			method: HttpMethod.GET,
			url: this.ALMA_CONFIG_GENERAL,
		}).pipe(
			switchMap(response => {
				const institutionCode: string = response.institution.value
				const networkCode: string = institutionCode.replace(/_.+/, `_${this.NETWORK}`)
				return of(networkCode)
			})
		)
	}

	resetNZUrlCache(): void {
		this.storeService.remove(this.NZ_URL_KEY)
			.subscribe(() => this.log.info('removed NZ URL from locale storage'))
	}
}
