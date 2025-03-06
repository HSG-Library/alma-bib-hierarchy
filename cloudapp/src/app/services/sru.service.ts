import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import {
  expand,
  map,
  reduce,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SruQuery } from '../sru/sru-query';
import { ConfigurationService } from './configuration.service';
import { LoadingIndicatorService } from './loading-indicator.service';
import { LogService } from './log.service';
import { SruResponseParserService } from './sru-response-parsers.service';
import { StatusMessageService } from './status-message.service';

@Injectable({
  providedIn: 'root',
})
export class SruService {
  private static readonly SRU_PATH: string = '/view/sru/';
  private readonly MAX_RECORDS: number = 50;

  private params: HttpParams;
  private nzUrl: string | undefined;

  public constructor(
    private configService: ConfigurationService,
    private parser: SruResponseParserService,
    private log: LogService,
    private loader: LoadingIndicatorService,
    private status: StatusMessageService,
    private httpClient: HttpClient,
    private storeService: CloudAppStoreService,
    private destroyRef: DestroyRef
  ) {
    this.params = new HttpParams()
      .set('version', '1.2')
      .set('operation', 'searchRetrieve')
      .set('recordSchema', 'marcxml');
  }

  public queryNZRecordCount(query: SruQuery): Observable<number> {
    return this.getNzUrl().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((url) => this.call(url, query, 1, 0)),
      switchMap((response) => of(this.parser.getNumberOfRecords(response)))
    );
  }

  public queryNZ(query: SruQuery): Observable<Element[]> {
    return this.getNzUrl().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((url) => this.call(url, query)),
      expand((response) => {
        const total: number = this.parser.getNumberOfRecords(response);
        const next: number = this.parser.getNextRecordPosition(response);
        if (total > 1) {
          this.loader.hasProgress(true);
          this.loader.setProgress(Math.round((next / total) * 100) + 1);
          this.status.set(
            'Calling SRU for records ' +
              next +
              ' to ' +
              (next + this.MAX_RECORDS - 1) +
              ' of ' +
              total
          );
        }
        if (next > 0) {
          return this.getNzUrl().pipe(
            switchMap((url) => this.call(url, query, next))
          );
        }
        return EMPTY;
      }),
      map((response) => {
        const result: Element[] = this.parser.getRecords(response);
        return result;
      }),
      tap(() => this.loader.hasProgress(false)),
      reduce((accData: Element[], data: Element[]) => accData.concat(data), [])
    );
  }

  private getNzUrl(): Observable<string> {
    this.log.info('getting NZ SRU URL');
    if (this.nzUrl) {
      this.log.info('NZ URL in inMemory cache:', this.nzUrl);
      return of(this.nzUrl);
    }

    return this.storeService.get(this.configService.NZ_URL_KEY).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((result) => {
        if (result) {
          this.log.info('NZ URL in local storage:', result);
          this.log.info('adding NZ URL to inMemory cache.');
          this.nzUrl = result;
          return of(result);
        } else {
          return forkJoin({
            url: this.configService.getAlmaUrl(),
            networkCode: this.configService.getNetworkCode(),
          }).pipe(
            switchMap((data) =>
              of(
                this.buildPath(data.url, SruService.SRU_PATH, data.networkCode)
              )
            ),
            tap((url) => {
              this.log.info(
                'Received NZ URL, adding to inMemory cache and local storage:',
                url
              );
              this.storeService
                .set(this.configService.NZ_URL_KEY, url)
                .subscribe(() =>
                  this.log.info('added NZ URL to local storage')
                );
              this.nzUrl = url;
            }),
            shareReplay(1)
          );
        }
      })
    );
  }

  private getParams(
    query: SruQuery,
    startRecord: number,
    maximumRecords: number
  ): HttpParams {
    return this.params
      .set(SruQuery.QUERY, query.get())
      .set('startRecord', String(startRecord))
      .set('maximumRecords', String(maximumRecords));
  }

  private call(
    url: string,
    query: SruQuery,
    startRecord: number = 1,
    maximumRecords: number = this.MAX_RECORDS
  ): Observable<string> {
    this.log.info('Executing SRU query:', query.name);
    const params: HttpParams = this.getParams(
      query,
      startRecord,
      maximumRecords
    );
    this.log.info('SRU Query URL: ', url + '?' + params.toString());
    return this.httpClient
      .get(url, {
        responseType: 'text',
        params: params,
      })
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  private buildPath(...args: string[]) {
    return args
      .map((part, i) => {
        if (i === 0) {
          return part.trim().replace(/[\/]*$/g, '');
        } else {
          return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
        }
      })
      .filter((pathParts) => pathParts.length)
      .join('/');
  }
}
