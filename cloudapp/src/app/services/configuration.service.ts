import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CloudAppConfigService,
  CloudAppRestService,
  CloudAppSettingsService,
  CloudAppStoreService,
  HttpMethod,
} from '@exlibris/exl-cloudapp-angular-lib';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Settings } from '../models/settings.model';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  public readonly NZ_URL_KEY = 'NZURL';

  private readonly ALMA_CONFIG_GENERAL: string = '/almaws/v1/conf/general';
  private readonly NETWORK: string = 'NETWORK';

  public constructor(
    private restService: CloudAppRestService,
    private settingsService: CloudAppSettingsService,
    private configService: CloudAppConfigService,
    private storeService: CloudAppStoreService,
    private log: LogService,
    private destroyRef: DestroyRef
  ) {}

  public getAlmaUrl(): Observable<string> {
    return this.settingsService.get().pipe(
      takeUntilDestroyed(this.destroyRef),
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

  public getAlmaUrlFromConfig(): Observable<string> {
    return this.configService.get().pipe(
      takeUntilDestroyed(this.destroyRef),
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

  public getAlmaUrlFromApi(): Observable<string> {
    return this.restService
      .call({
        method: HttpMethod.GET,
        url: this.ALMA_CONFIG_GENERAL,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
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

  public getNetworkCode(): Observable<string> {
    return this.settingsService.get().pipe(
      takeUntilDestroyed(this.destroyRef),
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

  public getNetworkCodeFromConfig(): Observable<string> {
    return this.configService.get().pipe(
      takeUntilDestroyed(this.destroyRef),
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

  public getNetworkCodeFromApi(): Observable<string> {
    return this.restService
      .call({
        method: HttpMethod.GET,
        url: this.ALMA_CONFIG_GENERAL,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
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
          return EMPTY;
        })
      );
  }

  public resetNZUrlCache(): void {
    this.storeService
      .remove(this.NZ_URL_KEY)
      .pipe(
        tap(() => this.log.info('Removed NZ URL from local storage')),
        catchError((error) => {
          this.log.error('Error removing NZ URL from local storage', error);
          return EMPTY;
        })
      )
      .subscribe();
  }
}
