import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { utils as XLSXutils, WorkBook, writeFile } from 'xlsx';
import { BibInfo } from '../models/bib-info.model';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  private readonly filePrefix: string = 'BibHierarchy-';
  private readonly fileExtension: string = '.xlsx';

  public export(
    data: BibInfo[],
    displayedColumns: string[],
    fileId: string
  ): Observable<any> {
    return this.createXlsxFile(
      this.sanitizeForExport(data, displayedColumns),
      fileId
    );
  }

  private sanitizeForExport(data: BibInfo[], displayedColumns: string[]): any {
    return data
      .map((entry) => {
        const row: { [key: string]: unknown } = {
          Order: entry.order,
          Title: entry.title,
          Year: entry.year,
          Edition: entry.edition,
          MMSID: entry.mmsId,
          Analytical: entry.analytical,
          Holdings: entry.holdings?.join(', '),
          'Possible duplicates': entry.duplicates?.join(', '),
        };
        entry.additionalInfo?.forEach((value, key) => {
          if (displayedColumns.lastIndexOf(key) >= 0) {
            row[key] = value;
          }
        });
        return row;
      })
      .sort((bibInfo1, bibInfo2) => {
        if (bibInfo1['Order'] && bibInfo2['Order']) {
          const regex: RegExp = /\b\d+\b/;
          const matchA: RegExpMatchArray | null = String(
            bibInfo1['Order']
          ).match(regex);
          const matchB: RegExpMatchArray | null = String(
            bibInfo2['Order']
          ).match(regex);
          if (matchA && matchB) {
            const aOrder: number = Number(matchA[0] || -1);
            const bOrder: number = Number(matchB[0] || -1);
            return aOrder - bOrder;
          } else {
            return -1;
          }
        } else {
          return !bibInfo1['Order'] && !bibInfo2['Order']
            ? 0
            : bibInfo1['Order'] && !bibInfo2['Order']
            ? 1
            : !bibInfo1['Order'] && bibInfo2['Order']
            ? -1
            : 0;
        }
      });
  }

  private createXlsxFile(data: any, fileId: string): Observable<any> {
    const ws = XLSXutils.json_to_sheet(data);
    const wb: WorkBook = XLSXutils.book_new();
    XLSXutils.book_append_sheet(wb, ws, 'Sheet1');
    return of(writeFile(wb, this.createFileName(fileId)));
  }

  private createFileName(fileId: string): string {
    return (
      this.filePrefix + fileId + '-' + this.currentDate() + this.fileExtension
    );
  }

  private currentDate(): string {
    const d = new Date();
    return (
      d.getFullYear() +
      '-' +
      (d.getMonth() + 1) +
      '-' +
      d.getDate() +
      '-' +
      d.getHours() +
      '-' +
      d.getMinutes() +
      '-' +
      d.getSeconds()
    );
  }
}
