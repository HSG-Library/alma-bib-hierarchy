import { Injectable } from '@angular/core';
import {
  CloudAppConfigService,
  CloudAppRestService,
  CloudAppSettingsService,
  CloudAppStoreService,
  HttpMethod,
} from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Settings } from '../models/settings.model';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly ALMA_CONFIG_GENERAL: string = '/almaws/v1/conf/general';
  private readonly NETWORK: string = 'NETWORK';
  readonly NZ_URL_KEY = 'NZURL';

  constructor(
    private restService: CloudAppRestService,
    private settingsService: CloudAppSettingsService,
    private configService: CloudAppConfigService,
    private storeService: CloudAppStoreService,
    private log: LogService
  ) {}

  getAlmaUrl(): Observable<string> {
    return this.settingsService.get().pipe(
      switchMap((result) => {
        const settings: Settings = result as Settings;
        if (settings && settings.almaSruUrl) {
          return of(settings.almaSruUrl);
        } else {
          return this.getAlmaUrlFromConfig();
        }
      }),
      catchError((error) => {
        this.log.error('Error getting Alma URL from settings', error);
        return of('');
      })
    );
  }

  getAlmaUrlFromConfig(): Observable<string> {
    return this.configService.get().pipe(
      switchMap((result) => {
        const settings: Settings = result as Settings;
        if (settings && settings.almaSruUrl) {
          return of(settings.almaSruUrl);
        } else {
          return this.getAlmaUrlFromApi();
        }
      }),
      catchError((error) => {
        this.log.error('Error getting Alma URL from config', error);
        return of('');
      })
    );
  }

  getAlmaUrlFromApi(): Observable<string> {
    return this.restService
      .call({
        method: HttpMethod.GET,
        url: this.ALMA_CONFIG_GENERAL,
      })
      .pipe(
        switchMap((response) => {
          const almaUrl: string = response?.alma_url;
          if (almaUrl) {
            return of(almaUrl);
          } else {
            this.log.error('Alma URL not found in API response');
            return of('');
          }
        }),
        catchError((error) => {
          this.log.error('Error getting Alma URL from API', error);
          return of('');
        })
      );
  }

  getNetworkCode(): Observable<string> {
    return this.settingsService.get().pipe(
      switchMap((result) => {
        const settings: Settings = result as Settings;
        if (settings && settings.networkCode) {
          return of(settings.networkCode);
        } else {
          return this.getNetworkCodeFromConfig();
        }
      }),
      catchError((error) => {
        this.log.error('Error getting Network Code from settings', error);
        return of('');
      })
    );
  }

  getNetworkCodeFromConfig(): Observable<string> {
    return this.configService.get().pipe(
      switchMap((result) => {
        const settings: Settings = result as Settings;
        if (settings && settings.networkCode) {
          return of(settings.networkCode);
        } else {
          return this.getNetworkCodeFromApi();
        }
      }),
      catchError((error) => {
        this.log.error('Error getting Network Code from config', error);
        return of('');
      })
    );
  }

  getNetworkCodeFromApi(): Observable<string> {
    return this.restService
      .call({
        method: HttpMethod.GET,
        url: this.ALMA_CONFIG_GENERAL,
      })
      .pipe(
        switchMap((response) => {
          const institutionCode: string = response?.institution?.value;
          if (institutionCode) {
            const networkCode: string = institutionCode.replace(
              /_.+/,
              `_${this.NETWORK}`
            );
            return of(networkCode);
          } else {
            this.log.error('Institution code not found in API response');
            return of('');
          }
        }),
        catchError((error) => {
          this.log.error('Error getting Network Code from API', error);
          return of('');
        })
      );
  }

  resetNZUrlCache(): void {
    this.storeService.remove(this.NZ_URL_KEY).subscribe(
      () => this.log.info('Removed NZ URL from local storage'),
      (error) =>
        this.log.error('Error removing NZ URL from local storage', error)
    );
  }
}
