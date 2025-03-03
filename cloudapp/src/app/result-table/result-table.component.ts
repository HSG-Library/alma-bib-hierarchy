import { Component, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { BibEntity } from '../models/bib-entity.model';
import { BibInfo } from '../models/bib-info.model';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss'],
})
export class ResultTableComponent {
  displayedColumns: string[] = [
    'order',
    'title',
    'year',
    'edition',
    'mmsId',
    'duplicate',
    'analytical',
    'holdings',
  ];
  additionalColumns: string[] = [];
  instCode: string;
  inPopup: boolean;
  @Input()
  result: MatTableDataSource<BibInfo>;
  @Input()
  selectedEntity: BibEntity;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private events: CloudAppEventsService) {
    this.events
      .getInitData()
      .subscribe((data) => (this.instCode = data.instCode));
  }

  getMatSort(): MatSort {
    return this.sort;
  }

  shortHolding(holding: string): string {
    return holding.replace(/^.+_/, '');
  }

  setAdditionalColumns(columns: string[]): void {
    this.additionalColumns = columns;
  }
}
