import { Injectable } from '@angular/core'
import { CloudAppConfigService, CloudAppRestService, CloudAppSettingsService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Settings } from '../models/settings.model'

@Injectable({
	providedIn: 'root'
})
export class ConfigurationService {

	private readonly ALMA_CONFIG_GENERAL: string = "/almaws/v1/conf/general"

	constructor(
		private restService: CloudAppRestService,
		private settingsService: CloudAppSettingsService,
		private configService: CloudAppConfigService,
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
}
