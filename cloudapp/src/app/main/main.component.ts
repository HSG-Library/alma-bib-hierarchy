import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { CloudAppEventsService, CloudAppRestService, Entity, EntityType, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable, of } from 'rxjs'
import { filter, switchMap, tap } from 'rxjs/operators'
import { BibEntity } from '../models/bib-entity.model'
import { BibInfo } from '../models/bib-info.model'
import { ResultTableComponent } from '../result-table/result-table.component'
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

  bibEntities: BibEntity[]
  selectedEntity: BibEntity

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
    private log: LogService,
    private loader: LoadingIndicatorService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
  ) { }

  ngOnInit() {
    this.loader.show()

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
      ).subscribe(records => {
        const bibInfos: BibInfo[] = this.sruParser.getBibInfo(records)
        const datasource = new MatTableDataSource(bibInfos.sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0)))
        datasource.sort = this.resultTable.getMatSort()
        this.bibInfoResult = datasource
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
