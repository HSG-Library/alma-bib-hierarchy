import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatSort, MatSortable } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { AlertService, CloudAppEventsService, CloudAppRestService, Entity, EntityType, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable, of } from 'rxjs'
import { filter, switchMap, tap } from 'rxjs/operators'
import { BibEntity } from '../models/bib-entity.model'
import { BibInfo } from '../models/bib-info.model'
import { ResultTableComponent } from '../result-table/result-table.component'
import { ConfigurationService } from '../services/configuration.service'
import { ExcelExportService } from '../services/excel-export.service'
import { LoadingIndicatorService } from '../services/loading-indicator.service'
import { LogService } from '../services/log.service'
import { SruResponseParserService } from '../services/sru-response-parsers.service'
import { SruService } from '../services/sru.service'
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

  expanded: boolean = false

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
    private loader: LoadingIndicatorService,
    private configService: ConfigurationService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.loader.show()
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
    bibEntity.nzMmsId
      .pipe(
        switchMap(nzMmsId => of(SruQuery.MMS_ID(nzMmsId))),
        switchMap(query => this.sruService.queryNZ(query)),
        switchMap(records => {
          const otherSystemNumbers: string[] = this.sruParser.getOtherSystemNumbers(records)
          this.log.info('other system numbers: ', otherSystemNumbers)
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER(otherSystemNumbers)
          return this.sruService.queryNZ(query)
        })
      ).subscribe(
        (records) => {
          const bibInfos: BibInfo[] = this.sruParser.getBibInfo(records)
          const bibInfosSorted: BibInfo[] = this.sortHoldings(bibInfos)
          const datasource = new MatTableDataSource(bibInfosSorted)
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

  expand(): void {
    // break out of iframe and dispatch a click event to the expand button of the CloudApp sidebar, due to lack of corresponding api. sorry
    window.parent.document.querySelector('#floating-sidepane-upper-actions-expand').dispatchEvent(new Event('click'))
    this.expanded = !this.expanded
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
      b.holdings.sort((a, b) => {
        if (a == this.instCode) {
          return -1
        }
        return a.localeCompare(b)
      })
      const holdings: string[] = b.holdings
      return new BibInfo(b.title, b.order, b.title, b.year, b.edition, holdings, b.duplicates)
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
        })
      )
  }

  private getRelatedRecords(bibEntity: BibEntity): Observable<number> {
    return bibEntity.nzMmsId
      .pipe(
        switchMap(nzMmsId => of(SruQuery.MMS_ID(nzMmsId))),
        switchMap(query => this.sruService.queryNZ(query)),
        switchMap(records => {
          const otherSystemNumbers: string[] = this.sruParser.getOtherSystemNumbers(records)
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER(otherSystemNumbers)
          return this.sruService.querNZRecordCount(query)
        })
      )
  }
}
