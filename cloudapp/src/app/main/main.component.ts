import { Component, DestroyRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  AlertService,
  CloudAppEventsService,
  CloudAppRestService,
  EntityType,
  HttpMethod,
} from '@exlibris/exl-cloudapp-angular-lib';
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BibEntity } from '../models/bib-entity.model';
import { BibInfo } from '../models/bib-info.model';
import { ResultTableComponent } from '../result-table/result-table.component';
import { ConfigurationService } from '../services/configuration.service';
import { ExcelExportService } from '../services/excel-export.service';
import { LoadingIndicatorService } from '../services/loading-indicator.service';
import { LogService } from '../services/log.service';
import { SruResponseParserService } from '../services/sru-response-parsers.service';
import { SruService } from '../services/sru.service';
import { StatusMessageService } from '../services/status-message.service';
import { SruQuery } from '../sru/sru-query';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  @ViewChild(ResultTableComponent)
  public resultTable!: ResultTableComponent;

  public bibEntities: BibEntity[] = [];
  public selectedEntity: BibEntity | null = null;
  public bibInfoResult: MatTableDataSource<BibInfo> | null = null;

  private instCode: string = '';
  private almaUrl: string = '';
  private availableAdditionalColumns: string[] = [];
  private entities$: Observable<BibEntity[]>;

  public constructor(
    public status: StatusMessageService,
    public loader: LoadingIndicatorService,
    private sruService: SruService,
    private sruParser: SruResponseParserService,
    private excelExportService: ExcelExportService,
    private log: LogService,
    private configService: ConfigurationService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private destroyRef: DestroyRef
  ) {
    this.entities$ = this.eventsService.entities$.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.reset()),
      filter((entities) =>
        entities.every((entity) => entity.type === EntityType.BIB_MMS)
      ),
      map((entities) =>
        entities.map((entity) => {
          let bibEntity: BibEntity = new BibEntity(entity);
          bibEntity.nzMmsId = this.getNzMmsIdFromEntity(bibEntity);
          return bibEntity;
        })
      ),
      tap((entities) => {
        this.bibEntities = entities;
      })
    );
  }

  public ngOnInit(): void {
    this.loader.show();
    this.status.set('loading');
    this.eventsService
      .getInitData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((data) => (this.instCode = data.instCode))
      )
      .subscribe();
    this.configService
      .getAlmaUrl()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((url) => (this.almaUrl = url))
      )
      .subscribe();
    this.entities$.subscribe();
  }

  public showHierarchyDown(bibEntity: BibEntity): void {
    this.selectedEntity = bibEntity;

    this.loader.show();
    this.status.set('Collecting infos for ' + bibEntity.entity.description);
    let currentNzMmsId: string;
    bibEntity.nzMmsId
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((nzMmsId) => {
          currentNzMmsId = nzMmsId;
          return of(SruQuery.MMS_ID(nzMmsId));
        }),
        tap(() => this.status.set('Collecting other system numbers')),
        switchMap((query) => this.sruService.queryNZ(query)),
        switchMap((records) => {
          const otherSystemNumbers: string[] =
            this.sruParser.getOtherSystemNumbers(records);
          this.status.set(
            'Found ' + otherSystemNumbers.length + ' system numbers'
          );
          const otherSystemNumbersAndMmsId = [
            ...otherSystemNumbers,
            currentNzMmsId,
          ];
          this.log.info(
            'other system numbers + mmsid, used for query: ',
            otherSystemNumbersAndMmsId
          );
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER(
            otherSystemNumbersAndMmsId
          );
          this.status.set('Querying SRU for related records');
          return this.sruService.queryNZ(query).pipe(
            map((records) => ({
              records,
              otherSystemNumbersAndMmsId,
            }))
          );
        }),
        tap(({ records, otherSystemNumbersAndMmsId }) => {
          const bibInfos: BibInfo[] = this.sruParser.getBibInfo(
            records,
            otherSystemNumbersAndMmsId
          );
          const bibInfosSorted: BibInfo[] = this.sortHoldings(bibInfos);
          if (bibInfos.length > 0) {
            this.availableAdditionalColumns = Array.from(
              bibInfos[0].additionalInfo.keys()
            );
            this.resultTable.setAdditionalColumns(
              this.availableAdditionalColumns
            );
          }
          const datasource = new MatTableDataSource(bibInfosSorted);
          datasource.sortData = this.tableSortFunction();
          const matSort: MatSort = this.resultTable.getMatSort();
          matSort.sort({ id: 'order', start: 'asc' } as MatSortable);
          datasource.sort = matSort;
          this.bibInfoResult = datasource;
          this.loader.hide();
        }),
        catchError((error) => {
          this.alert.error(
            `Could not show hierarchy, please check the Alma URL '${this.almaUrl}'`,
            { autoClose: false }
          );
          this.log.error('Error in showHierarchyDown()', error);
          this.reset();
          this.loader.hide();
          return EMPTY;
        })
      )
      .subscribe();
  }

  public showHierarchyUp(bibEntity: BibEntity): void {
    this.selectedEntity = bibEntity;
    this.loader.show();
    this.status.set('Collecting infos for ' + bibEntity.entity.description);
    bibEntity.nzMmsId
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((nzMmsId) => {
          return of(SruQuery.MMS_ID(nzMmsId));
        }),
        tap(() => this.status.set('Collecting other system numbers')),
        switchMap((query) => this.sruService.queryNZ(query)),
        switchMap((records) => {
          const upwardSystemNumbers: string[] =
            this.sruParser.getUpwardSystemNumbers(records);
          this.status.set(
            'Found ' + upwardSystemNumbers.length + ' system numbers'
          );
          const query035a: SruQuery =
            SruQuery.OTHER_SYSTEM_NUMBER_ACTIVE_035(upwardSystemNumbers);
          const queryMmsId: SruQuery = SruQuery.MMS_IDS(
            upwardSystemNumbers.filter((systemNumber) => !isNaN(+systemNumber))
          );
          const queryHierarchyUpward: SruQuery = query035a.or(queryMmsId);
          this.status.set('Querying SRU for related records');
          return this.sruService.queryNZ(queryHierarchyUpward).pipe(
            map((records) => ({
              records,
              upwardSystemNumbers,
            }))
          );
        }),
        tap(({ records, upwardSystemNumbers }) => {
          const bibInfos: BibInfo[] = this.sruParser.getBibInfo(
            records,
            upwardSystemNumbers
          );
          const bibInfosSorted: BibInfo[] = this.sortHoldings(bibInfos);
          if (bibInfos.length > 0) {
            this.availableAdditionalColumns = Array.from(
              bibInfos[0].additionalInfo.keys()
            );
            this.resultTable.setAdditionalColumns(
              this.availableAdditionalColumns
            );
          }
          const datasource = new MatTableDataSource(bibInfosSorted);
          datasource.sortData = this.tableSortFunction();
          const matSort: MatSort = this.resultTable.getMatSort();
          matSort.sort({ id: 'order', start: 'asc' } as MatSortable);
          datasource.sort = matSort;
          this.bibInfoResult = datasource;
          this.loader.hide();
        }),
        catchError((error) => {
          this.alert.error(
            `Could not show hierarchy, please check the Alma URL '${this.almaUrl}'`,
            { autoClose: false }
          );
          console.error('Error in showHierarchyUp()', error);
          this.reset();
          this.loader.hide();
          return EMPTY;
        })
      )
      .subscribe();
  }

  public reset(): void {
    this.selectedEntity = null;
    this.bibInfoResult = null;
    this.availableAdditionalColumns = [];
  }

  public export(): void {
    this.loader.show();
    this.excelExportService
      .export(
        this.bibInfoResult?.data || [],
        this.resultTable?.displayedColumns || [],
        this.selectedEntity?.entity?.id || ''
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.alert.error(`Error during Excel export'`, { autoClose: false });
          this.log.error('Error in export()', error);
          return EMPTY;
        }),
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe();
  }

  public getAvailableAdditionalColumns(): string[] {
    return this.availableAdditionalColumns || [];
  }

  public toggleAdditionalColumn(column: string): void {
    const index: number = this.resultTable.displayedColumns.lastIndexOf(column);
    if (index >= 0) {
      this.resultTable.displayedColumns.splice(index, 1);
    } else {
      this.resultTable.displayedColumns.push(column);
    }
  }

  private sortHoldings(bibInfos: BibInfo[]): BibInfo[] {
    return bibInfos.map((bibInfo) => {
      bibInfo.holdings.sort((o1, o2) => {
        if (o1 == this.instCode) {
          return -1;
        }
        return o1.localeCompare(o2);
      });
      const holdings: string[] = bibInfo.holdings;
      return new BibInfo(
        bibInfo.mmsId,
        bibInfo.order,
        bibInfo.title,
        bibInfo.year,
        bibInfo.edition,
        holdings,
        bibInfo.analytical,
        bibInfo.additionalInfo,
        bibInfo.duplicates
      );
    });
  }

  private getNzMmsIdFromEntity(bibEntity: BibEntity): Observable<string> {
    const id = bibEntity.entity.id;
    if (bibEntity.entity.link.indexOf('?nz_mms_id') >= 0) {
      return of(id);
    }
    return this.restService
      .call({
        method: HttpMethod.GET,
        url: bibEntity.entity.link,
        queryParams: { view: 'brief' },
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((response) => {
          const nzMmsId: string = response?.linked_record_id?.value;
          this.log.info('nzMmsId', nzMmsId);
          return of(nzMmsId);
        }),
        catchError((error) => {
          this.log.info(
            'Cannot get NZ MMSID from API. Assuming the MMSID is already from NZ.',
            error
          );
          return of(bibEntity.entity.id);
        }),
        shareReplay(1)
      );
  }

  public getRelatedRecords(bibEntity: BibEntity) {
    let currentNzMmsId: string;
    return bibEntity.nzMmsId
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((nzMmsId) => {
          currentNzMmsId = nzMmsId;
          return of(SruQuery.MMS_ID(nzMmsId));
        }),
        switchMap((query) => {
          console.log('invoke query');
          return this.sruService.queryNZ(query);
        }),
        switchMap((records) => {
          const otherSystemNumbers: string[] =
            this.sruParser.getOtherSystemNumbers(records);
          console.log('otherSystemNumbers', otherSystemNumbers);
          if (otherSystemNumbers.length == 0) {
            return of(0);
          }
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER([
            ...otherSystemNumbers,
            currentNzMmsId,
          ]);
          return this.sruService.queryNZRecordCount(query);
        }),
        tap((result) => {
          console.log('subscribe result', result);
          bibEntity.relatedRecords = result;
        })
      )
      .subscribe();
  }

  private tableSortFunction(): (items: BibInfo[], sort: MatSort) => BibInfo[] {
    return (items: BibInfo[], sort: MatSort): BibInfo[] => {
      return items.sort((a: BibInfo, b: BibInfo) => {
        let comparatorResult = 0;
        switch (sort.active) {
          case 'order':
            if (a.order && b.order) {
              const regex: RegExp = /\b\d+\b/;
              const matchA: RegExpMatchArray | null = a.order.match(regex);
              const matchB: RegExpMatchArray | null = b.order.match(regex);
              if (matchA && matchB) {
                const aOrder: number = Number(matchA[0] || -1);
                const bOrder: number = Number(matchB[0] || -1);
                comparatorResult = aOrder - bOrder;
              } else {
                comparatorResult = -1;
              }
            } else {
              comparatorResult =
                !a.order && !b.order
                  ? 0
                  : a.order && !b.order
                  ? 1
                  : !a.order && b.order
                  ? -1
                  : 0;
            }
            break;
          case 'title':
            comparatorResult = a.title.localeCompare(b.title);
            break;
          case 'year':
            comparatorResult = a.year - b.year;
            break;
          case 'edition':
            comparatorResult = a.edition.localeCompare(b.edition);
            break;
          case 'mmsId':
            comparatorResult = a.mmsId.localeCompare(b.mmsId);
            break;
          case 'duplicate':
            if (a.duplicates && b.duplicates) {
              const aDup0: number = Number(a.duplicates[0] || -1);
              const bDup0: number = Number(b.duplicates[0] || -1);
              comparatorResult = aDup0 - bDup0;
            } else {
              comparatorResult =
                !a.duplicates && !b.duplicates
                  ? 0
                  : a.duplicates && !b.duplicates
                  ? 1
                  : !a.duplicates && b.duplicates
                  ? -1
                  : 0;
            }
            break;
          case 'holdings':
            const aHol0: string = a.holdings[0] || '-';
            const bHol0: string = b.holdings[0] || '-';
            comparatorResult = aHol0.localeCompare(bHol0);
            break;
          default:
            comparatorResult = 0;
            break;
        }
        return comparatorResult * (sort.direction == 'asc' ? 1 : -1);
      });
    };
  }
}
