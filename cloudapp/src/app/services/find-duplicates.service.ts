import { Injectable } from '@angular/core';
import { BibInfo } from '../models/bib-info.model';

@Injectable({
  providedIn: 'root',
})
export class FindDuplicatesService {
  public findPossibleDuplicates(bibInfos: BibInfo[]): BibInfo[] {
    if (!bibInfos || !Array.isArray(bibInfos)) {
      return [];
    }

    const lookup: Lookup = {};

    bibInfos.forEach((bibInfo) => {
      if (!bibInfo) {
        return;
      }
      const id: string = this.getDeduplicatedId(bibInfo);
      if (lookup.hasOwnProperty(id)) {
        const entry: LookupEntry = lookup[id];
        entry.duplicates.push(bibInfo.mmsId);
        lookup[id] = entry;
      } else {
        const entry: LookupEntry = {
          mmsId: bibInfo.mmsId,
          duplicates: [bibInfo.mmsId],
        };
        lookup[id] = entry;
      }
    });

    const duplicates: LookupEntry[] = this.cleanupLookupTable(lookup);

    return bibInfos.map((bibInfo) => {
      if (!bibInfo) {
        return bibInfo;
      }

      const duplicateInfo: LookupEntry | undefined = duplicates.find(
        (entry) => entry.mmsId == bibInfo.mmsId
      );
      if (duplicateInfo && bibInfo.order) {
        return new BibInfo(
          bibInfo.mmsId,
          bibInfo.order,
          bibInfo.title,
          bibInfo.year,
          bibInfo.edition,
          bibInfo.holdings,
          bibInfo.analytical,
          bibInfo.additionalInfo,
          duplicateInfo.duplicates
        );
      }
      return bibInfo;
    });
  }

  private getDeduplicatedId(bibInfo: BibInfo): string {
    if (!bibInfo) {
      return '';
    }
    return (bibInfo.order || '') + (bibInfo.edition || '');
  }

  private cleanupLookupTable(lookup: Lookup): LookupEntry[] {
    let duplicates: LookupEntry[] = [];
    for (let key in lookup) {
      if (!lookup.hasOwnProperty(key)) {
        continue;
      }

      const lookUpEntry: LookupEntry = lookup[key];
      if (lookUpEntry.duplicates.length > 1) {
        const expandedDuplicates: LookupEntry[] = lookUpEntry.duplicates.map(
          (dup) => {
            const filteredDuplicates: string[] = lookUpEntry.duplicates.filter(
              (d) => d != dup
            );
            return { mmsId: dup, duplicates: filteredDuplicates };
          }
        );
        duplicates = duplicates.concat(expandedDuplicates);
      }
    }
    return duplicates;
  }
}

type Lookup = { [k: string]: { mmsId: string; duplicates: string[] } };

type LookupEntry = {
  mmsId: string;
  duplicates: string[];
};
