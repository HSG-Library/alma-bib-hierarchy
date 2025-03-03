import { Injectable } from '@angular/core';
import { BibInfo } from '../models/bib-info.model';

@Injectable({
  providedIn: 'root',
})
export class FindDuplicatesService {
  findPossibleDuplicates(bibInfos: BibInfo[]): BibInfo[] {
    const lookup: Lookup = {};

    bibInfos.forEach((b) => {
      const id: string = this.getDeduplicatedId(b);
      if (lookup.hasOwnProperty(id)) {
        const entry: LookupEntry = lookup[id];
        entry.duplicates.push(b.mmsId);
        lookup[id] = entry;
      } else {
        const entry: LookupEntry = { mmsId: b.mmsId, duplicates: [b.mmsId] };
        lookup[id] = entry;
      }
    });

    const duplicates: LookupEntry[] = this.cleanupLookupTable(lookup);

    return bibInfos.map((b) => {
      const duplicateInfo: LookupEntry = duplicates.find(
        (entry) => entry.mmsId == b.mmsId
      );
      if (duplicateInfo && b.order) {
        return new BibInfo(
          b.mmsId,
          b.order,
          b.title,
          b.year,
          b.edition,
          b.holdings,
          b.analytical,
          b.additionalInfo,
          duplicateInfo.duplicates
        );
      }
      return b;
    });
  }

  private getDeduplicatedId(bibInfo: BibInfo): string {
    return bibInfo?.order + bibInfo?.edition;
  }

  private cleanupLookupTable(lookup: Lookup): LookupEntry[] {
    let duplicates: LookupEntry[] = [];
    for (let key in lookup) {
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
