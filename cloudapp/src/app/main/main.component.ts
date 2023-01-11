import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatSort, MatSortable } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { AlertService, CloudAppEventsService, CloudAppRestService, Entity, EntityType, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable, of } from 'rxjs'
import { catchError, filter, shareReplay, switchMap, tap } from 'rxjs/operators'
import { BibEntity } from '../models/bib-entity.model'
import { BibInfo } from '../models/bib-info.model'
import { ResultTableComponent } from '../result-table/result-table.component'
import { ConfigurationService } from '../services/configuration.service'
import { ExcelExportService } from '../services/excel-export.service'
import { LoadingIndicatorService } from '../services/loading-indicator.service'
import { LogService } from '../services/log.service'
import { SruResponseParserService } from '../services/sru-response-parsers.service'
import { SruService } from '../services/sru.service'
import { StatusMessageService } from '../services/status-message.service.ts'
import { SruQuery } from '../sru/sru-query'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  instCode: string
  bibEntities: BibEntity[]
  selectedEntity: BibEntity
  almaUrl: string

  bibInfoResult: MatTableDataSource<BibInfo>

  @ViewChild(ResultTableComponent) resultTable: ResultTableComponent

  entities$: Observable<Entity[]> = this.eventsService.entities$
    .pipe(
      tap(() => this.reset()),
      filter(entites => entites.every(entity => entity.type === EntityType.BIB_MMS))
    )

  constructor(
    private sruService: SruService,
    private sruParser: SruResponseParserService,
    private excelExportService: ExcelExportService,
    private log: LogService,
    private configService: ConfigurationService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    public status: StatusMessageService,
    public loader: LoadingIndicatorService,
  ) { }

  ngOnInit(): void {
    this.loader.show()
    this.status.set("loading")
    this.eventsService.getInitData().subscribe(data => this.instCode = data.instCode)
    this.configService.getAlmaUrl().subscribe(url => this.almaUrl = url)

    this.entities$
      .pipe(
        switchMap(entities => of(
          entities.map(entity => {
            let bibEntity: BibEntity = new BibEntity(entity)
            bibEntity.nzMmsId = this.getNzMmsIdFromEntity(bibEntity)
            bibEntity.relatedRecords = this.getRelatedRecords(bibEntity)
            return bibEntity
          })
        ))
      ).subscribe(entites => {
        this.bibEntities = entites
      })
  }

  ngOnDestroy(): void {
  }

  showHierarchy(bibEntity: BibEntity): void {
    this.selectedEntity = bibEntity

    this.loader.show()
    this.status.set('Collecting infos for ' + bibEntity.entity.description)
    let currentNzMmsId: string
    bibEntity.nzMmsId
      .pipe(
        switchMap(nzMmsId => {
          currentNzMmsId = nzMmsId
          return of(SruQuery.MMS_ID(nzMmsId))
        }),
        tap(() => this.status.set('Collecting other system numbers')),
        switchMap(query => this.sruService.queryNZ(query)),
        switchMap(records => {
          const otherSystemNumbers: string[] = this.sruParser.getOtherSystemNumbers(records)
          this.status.set('Found ' + otherSystemNumbers.length + ' system numbers')
          this.log.info('other system numbers: ', otherSystemNumbers)
          const otherSystemNumbersAndMmsId = [...otherSystemNumbers, currentNzMmsId]
          this.log.info('other system numbers + mmsid, used for query: ', otherSystemNumbersAndMmsId)
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER(otherSystemNumbersAndMmsId)
          this.status.set('Querying SRU for related records')
          return this.sruService.queryNZ(query)
        })
      ).subscribe(
        (records) => {
          const bibInfos: BibInfo[] = this.sruParser.getBibInfo(records)
          const bibInfosSorted: BibInfo[] = this.sortHoldings(bibInfos)
          const datasource = new MatTableDataSource(bibInfosSorted)
          datasource.sortData = this.tableSortFunction()
          const matSort: MatSort = this.resultTable.getMatSort()
          matSort.sort(({ id: 'order', start: 'asc' }) as MatSortable)
          datasource.sort = matSort
          this.bibInfoResult = datasource
          this.loader.hide()
        },
        (error) => {
          this.alert.error(`Could not show hierarchy, please check the Alma URL '${this.almaUrl}'`, { autoClose: false })
          console.error('Error in showHierarchy()', error)
          this.reset()
          this.loader.hide()
        })
  }

  reset(): void {
    this.selectedEntity = null
    this.bibInfoResult = null
  }

  export(): void {
    this.loader.show()
    this.excelExportService.export(this.bibInfoResult.data, this.selectedEntity.entity.id)
      .subscribe(
        (result) => {
          this.loader.hide()
        },
        (error) => {
          this.alert.error(`Error during Excel export'`, { autoClose: false })
          this.log.error('Error in export()', error)
          this.loader.hide()
        }
      )
  }

  private sortHoldings(bibInfos: BibInfo[]): BibInfo[] {
    return bibInfos.map(b => {
      b.holdings.sort((o1, o2) => {
        if (o1 == this.instCode) {
          return -1
        }
        return o1.localeCompare(o2)
      })
      const holdings: string[] = b.holdings
      return new BibInfo(b.mmsId, b.order, b.title, b.year, b.edition, holdings, b.analytical, b.duplicates)
    })
  }

  private getNzMmsIdFromEntity(bibEntity: BibEntity): Observable<string> {
    const id = bibEntity.entity.id
    if (bibEntity.entity.link.indexOf("?nz_mms_id") >= 0) {
      return of(id)
    }
    return this.restService.call({
      method: HttpMethod.GET,
      url: bibEntity.entity.link,
      queryParams: { view: 'brief' }
    })
      .pipe(
        tap(response => console.log(response)),
        switchMap(response => {
          const nzMmsId: string = response?.linked_record_id?.value
          this.log.info('nzMmsId', nzMmsId)
          return of(nzMmsId)
        }),
        catchError(error => {
          this.log.error('Cannot get NZ MMSID from API. Assuming the MMSID is already from NZ.', error)
          return of(bibEntity.entity.id)
        }),
        shareReplay(1)
      )
  }

  private getRelatedRecords(bibEntity: BibEntity): Observable<number> {
    let currentNzMmsId: string
    return bibEntity.nzMmsId
      .pipe(
        switchMap(nzMmsId => {
          currentNzMmsId = nzMmsId
          return of(SruQuery.MMS_ID(nzMmsId))
        }),
        switchMap(query => this.sruService.queryNZ(query)),
        switchMap(records => {
          const otherSystemNumbers: string[] = this.sruParser.getOtherSystemNumbers(records)
          if (otherSystemNumbers.length == 0) {
            return of(0)
          }
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER([...otherSystemNumbers, currentNzMmsId])
          return this.sruService.querNZRecordCount(query)
        }),
        shareReplay(1)
      )
  }

  private tableSortFunction(): (items: BibInfo[], sort: MatSort) => BibInfo[] {
    return (items: BibInfo[], sort: MatSort): BibInfo[] => {
      return items.sort((a: BibInfo, b: BibInfo) => {
        let comparatorResult = 0
        switch (sort.active) {
          case 'order':
            if (a.order && b.order) {
              const regex: RegExp = /\b\d+\b/
              const matchA: RegExpMatchArray = a.order.match(regex)
              const matchB: RegExpMatchArray = b.order.match(regex)
              if (matchA && matchB) {
                const aOrder: number = Number(matchA[0] || -1)
                const bOrder: number = Number(matchB[0] || -1)
                comparatorResult = aOrder - bOrder
              } else {
                comparatorResult = -1
              }
            } else {
              comparatorResult = !a.order && !b.order ? 0 : a.order && !b.order ? 1 : !a.order && b.order ? -1 : 0
            }
            break
          case 'title':
            comparatorResult = a.title.localeCompare(b.title)
            break
          case 'year':
            comparatorResult = a.year - b.year
            break
          case 'edition':
            comparatorResult = a.edition.localeCompare(b.edition)
            break
          case 'mmsId':
            comparatorResult = a.mmsId.localeCompare(b.mmsId)
            break
          case 'duplicate':
            if (a.duplicates && b.duplicates) {
              const aDup0: number = Number(a.duplicates[0] || -1)
              const bDup0: number = Number(b.duplicates[0] || -1)
              comparatorResult = aDup0 - bDup0
            } else {
              comparatorResult = !a.duplicates && !b.duplicates ? 0 : a.duplicates && !b.duplicates ? 1 : !a.duplicates && b.duplicates ? -1 : 0
            }
            break
          case 'holdings':
            const aHol0: string = a.holdings[0] || '-'
            const bHol0: string = b.holdings[0] || '-'
            comparatorResult = aHol0.localeCompare(bHol0)
            break
          default:
            console.log('fallback for', sort.active)
            comparatorResult = 0
            break
        }
        return comparatorResult * (sort.direction == 'asc' ? 1 : -1)
      })
    }
  }

}
