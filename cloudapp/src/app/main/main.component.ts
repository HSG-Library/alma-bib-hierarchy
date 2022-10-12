import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatRadioChange } from '@angular/material/radio'
import { CloudAppEventsService, CloudAppRestService, Entity, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable, of } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'
import { BibInfo } from '../models/bib-info.model'
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

  apiResult1: any
  apiResult2: any
  resultCount: number
  selectedEntity: Entity

  entities$: Observable<Entity[]> = this.eventsService.entities$
    .pipe(tap(() => this.clear()))

  constructor(
    private sruService: SruService,
    private sruParser: SruResponseParserService,
    private log: LogService,
    private loader: LoadingIndicatorService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService
  ) { }

  ngOnInit() {
    this.eventsService.getInitData().subscribe(
      initData => console.log('initData', initData)
    )
    this.loader.hide()
  }

  ngOnDestroy(): void {
  }

  entitySelected(event: MatRadioChange) {
    const entity: Entity = event.value as Entity
    this.log.info(entity)
    this.loader.show()
    this.getNzMmsIdFromEntity(entity)
      .pipe(
        switchMap(nzMmsId => of(SruQuery.MMS_ID(nzMmsId))),
        switchMap(query => this.sruService.queryNZ(query)),
        switchMap(records => {
          const otherSystemNumbers: string[] = this.sruParser.getOtherSystemNumbers(records)
          this.log.info('other system numbers: ', otherSystemNumbers)
          this.apiResult1 = otherSystemNumbers
          const query: SruQuery = SruQuery.OTHER_SYSTEM_NUMBER(otherSystemNumbers)
          return this.sruService.queryNZ(query)
        })
      ).subscribe((records) => {
        const bibInfos: BibInfo[] = this.sruParser.getBibInfo(records)
        this.resultCount = bibInfos.length
        this.apiResult2 = bibInfos.sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))
        this.loader.hide()
      })
  }

  clear() {
    this.apiResult1 = null
    this.apiResult2 = null
    this.resultCount = null
    this.selectedEntity = null
  }

  private getNzMmsIdFromEntity(entity: Entity): Observable<string> {
    const id = entity.id
    if (entity.link.indexOf("?nz_mms_id") >= 0) {
      return of(id)
    }
    return this.restService.call({
      method: HttpMethod.GET,
      url: entity.link,
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
}
