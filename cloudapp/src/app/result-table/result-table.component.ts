import { Component, DestroyRef, Input, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BibEntity } from '../models/bib-entity.model';
import { BibInfo } from '../models/bib-info.model';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss'],
})
export class ResultTableComponent {
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Input()
  public result: MatTableDataSource<BibInfo> | null = null;
  @Input()
  public selectedEntity: BibEntity | null = null;

  public displayedColumns: string[] = [
    'order',
    'title',
    'year',
    'edition',
    'mmsId',
    'duplicate',
    'analytical',
    'holdings',
  ];
  public additionalColumns: string[] = [];
  public instCode: string = '';
  public inPopup: boolean = false;

  public constructor(
    private events: CloudAppEventsService,
    private destroyRef: DestroyRef
  ) {
    this.events
      .getInitData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.error('Error getting init data', error);
          return of({ instCode: '' });
        }),
        tap((data) => (this.instCode = data.instCode))
      )
      .subscribe();
  }

  public getMatSort(): MatSort {
    return this.sort;
  }

  public shortHolding(holding: string): string {
    return holding?.replace(/^.+_/, '') ?? '';
  }

  public setAdditionalColumns(columns: string[]): void {
    this.additionalColumns = columns ?? [];
  }
}
