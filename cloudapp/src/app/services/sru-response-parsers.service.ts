import { Injectable } from '@angular/core';
import { BibInfo } from '../models/bib-info.model';
import { FindDuplicatesService } from './find-duplicates.service';

@Injectable({
  providedIn: 'root',
})
export class SruResponseParserService {
  private static readonly RECORD_NS: string = 'http://www.loc.gov/MARC21/slim';
  private static readonly NS_RESOLVER: XPathNSResolver = () =>
    SruResponseParserService.RECORD_NS;

  private readonly XPATH_QUERY_035a: string =
    "//default:datafield[@tag='035']/default:subfield[@code='a']";
  private readonly XPATH_QUERY_001_MMSID: string =
    "//default:controlfield[@tag='001']";
  private readonly XPATH_QUERY_800v_ORDER: string =
    "//default:datafield[@tag='800']/default:subfield[@code='v']";
  private readonly XPATH_QUERY_810v_ORDER: string =
    "//default:datafield[@tag='810']/default:subfield[@code='v']";
  private readonly XPATH_QUERY_830v_ORDER: string =
    "//default:datafield[@tag='830']/default:subfield[@code='v']";
  private readonly XPATH_QUERY_773g_ORDER: string =
    "//default:datafield[@tag='773']/default:subfield[@code='g']";
  private readonly XPATH_QUERY_773q_ORDER: string =
    "//default:datafield[@tag='773']/default:subfield[@code='q']";
  private readonly XPATH_QUERY_245_TITLE: string =
    "//default:datafield[@tag='245']/default:subfield";
  private readonly XPATH_QUERY_008_YEAR: string =
    "//default:controlfield[@tag='008']";
  private readonly XPATH_QUERY_250_EDITION: string =
    "//default:datafield[@tag='250']/default:subfield";
  private readonly XPATH_QUERY_852_HOLDINGS_A: string =
    "//default:datafield[@tag='852']/default:subfield[@code='a']";
  private readonly XPATH_QUERY_852_HOLDINGS_B: string =
    "//default:datafield[@tag='852']/default:subfield[@code='b']";
  private readonly XPATH_QUERY_LEADER_ANALYTICAL: string = '//default:leader';
  // query for upward hierarchy
  private readonly XPATH_QUERY_773w: string =
    "//default:datafield[@tag='773']/default:subfield[@code='w']";
  private readonly XPATH_QUERY_800w: string =
    "//default:datafield[@tag='800']/default:subfield[@code='w']";
  private readonly XPATH_QUERY_810w: string =
    "//default:datafield[@tag='810']/default:subfield[@code='w']";
  private readonly XPATH_QUERY_811w: string =
    "//default:datafield[@tag='811']/default:subfield[@code='w']";
  private readonly XPATH_QUERY_830w: string =
    "//default:datafield[@tag='830']/default:subfield[@code='w']";

  private readonly XPATH_QUERY_ADDITIONAL: Map<string, string> = new Map<
    string,
    string
  >([
    ['040$e', "//default:datafield[@tag='040']/default:subfield[@code='e']"],
    ['490$a', "//default:datafield[@tag='490']/default:subfield[@code='a']"],
    ['490$v', "//default:datafield[@tag='490']/default:subfield[@code='v']"],
    ['773$g', "//default:datafield[@tag='773']/default:subfield[@code='g']"],
    ['773$t', "//default:datafield[@tag='773']/default:subfield[@code='t']"],
    ['800$a', "//default:datafield[@tag='800']/default:subfield[@code='a']"],
    ['800$t', "//default:datafield[@tag='800']/default:subfield[@code='t']"],
    ['800$v', "//default:datafield[@tag='800']/default:subfield[@code='v']"],
    ['810$a', "//default:datafield[@tag='810']/default:subfield[@code='a']"],
    ['810$t', "//default:datafield[@tag='810']/default:subfield[@code='t']"],
    ['810$v', "//default:datafield[@tag='810']/default:subfield[@code='v']"],
    ['811$a', "//default:datafield[@tag='811']/default:subfield[@code='a']"],
    ['811$t', "//default:datafield[@tag='811']/default:subfield[@code='t']"],
    ['811$v', "//default:datafield[@tag='811']/default:subfield[@code='v']"],
    ['830$a', "//default:datafield[@tag='830']/default:subfield[@code='a']"],
    ['830$t', "//default:datafield[@tag='830']/default:subfield[@code='t']"],
    ['830$v', "//default:datafield[@tag='830']/default:subfield[@code='v']"],
  ]);

  // dynamic queries
  private getXPathQueryCodeIfOtherCodeEquals(
    fieldNumber: string,
    getCode: string,
    predicateCode: string,
    systemNumbers: string[]
  ): string {
    const conditions = systemNumbers
      .map(
        (systemNumber) =>
          `default:subfield[@code='${predicateCode}' and text()='${systemNumber}']`
      )
      .join(' or ');
    return `
    //default:datafield[@tag='${fieldNumber}' and (${conditions || '"-"'})]
    /default:subfield[@code='${getCode}']
  `;
  }

  public constructor(private duplicateService: FindDuplicatesService) {}

  public getRecords(xmlString: string): Element[] {
    const recordDocument: Document = this.extractRecords(xmlString);
    return Array.from(recordDocument.getElementsByTagName('record'));
  }

  public getOtherSystemNumbers(records: Element[]): string[] {
    if (!records || records.length === 0) {
      console.warn('No records - cannot query for other system numbers');
      return [];
    }
    return records
      .map((record) => {
        const tempDoc: Document = new Document();
        tempDoc.append(record);
        return this.xpathQuery(tempDoc, this.XPATH_QUERY_035a);
      })
      .reduce((acc, curr) => acc.concat(curr), []);
  }

  public getUpwardSystemNumbers(records: Element[]): string[] {
    if (!records || records.length === 0) {
      console.warn('No records - cannot query for upward system numbers');
      return [];
    }
    return records
      .map((record) => {
        const tempDoc: Document = new Document();
        tempDoc.append(record);
        const field773w = this.xpathQuery(tempDoc, this.XPATH_QUERY_773w);
        const field800w = this.xpathQuery(tempDoc, this.XPATH_QUERY_800w);
        const field810w = this.xpathQuery(tempDoc, this.XPATH_QUERY_810w);
        const field811w = this.xpathQuery(tempDoc, this.XPATH_QUERY_811w);
        const field830w = this.xpathQuery(tempDoc, this.XPATH_QUERY_830w);
        return field773w.concat(field800w, field810w, field811w, field830w);
      })
      .reduce((acc, curr) => acc.concat(curr), []);
  }

  public getBibInfo(records: Element[], systemNumbers: string[]): BibInfo[] {
    if (!records || records.length === 0) {
      console.warn('No records - cannot query for bib info');
      return [];
    }
    const bibInfos: BibInfo[] = records.map((record) => {
      const singleRecordDocument: Document = new Document();
      singleRecordDocument.append(record);
      const mmsId: string = this.extractMmsId(singleRecordDocument);
      const order: string = this.extractOrder(
        singleRecordDocument,
        systemNumbers
      );
      const title: string = this.extractTitle(singleRecordDocument);
      const year: number = this.extractYear(singleRecordDocument);
      const edition: string = this.extractEdition(singleRecordDocument);
      const holdings: string[] = this.extractHoldings(singleRecordDocument);
      const analytical: boolean = this.extractAnalytical(singleRecordDocument);
      const additional: Map<string, string> =
        this.extractAdditional(singleRecordDocument);
      return new BibInfo(
        mmsId,
        order,
        title,
        year,
        edition,
        holdings,
        analytical,
        additional
      );
    });
    return this.duplicateService.findPossibleDuplicates(bibInfos);
  }

  private extractMmsId(document: Document): string {
    const field001: string[] = this.xpathQuery(
      document,
      this.XPATH_QUERY_001_MMSID
    );
    return field001[0] || '';
  }

  private extractOrder(document: Document, systemNumbers: string[]): string {
    const fields = ['800', '810', '830'];
    let order: string | undefined = '';

    for (const field of fields) {
      const query = this.getXPathQueryCodeIfOtherCodeEquals(
        field,
        'v',
        'w',
        systemNumbers
      );
      const result: string[] = this.xpathQuery(document, query);
      if (result.length > 0) {
        order = result.find((entry) => entry);
        if (order) break;
      }
    }

    if (!order) {
      const query773g: string = this.getXPathQueryCodeIfOtherCodeEquals(
        '773',
        'g',
        'w',
        systemNumbers
      );
      const field773g: string[] = this.xpathQuery(document, query773g);
      order = field773g
        .filter((e) => e.startsWith('no:'))
        .map((e) => e.match(/\d+/))
        .filter((match) => match !== null)
        .map((match) => match[0])[0];

      if (!order) {
        order = field773g
          .filter((e) => e?.match(/\d+/))
          .filter((e) => e.indexOf('year:') == -1)
          .map((e) => e?.match(/\d+/))
          .filter((match) => match !== null)
          .map((match) => match[0])[0];
      }

      if (!order) {
        const query773q: string = this.getXPathQueryCodeIfOtherCodeEquals(
          '773',
          'q',
          'w',
          systemNumbers
        );
        const field773q: string[] = this.xpathQuery(document, query773q);
        order = field773q
          .filter((e) => e?.match(/\d+/))
          .map((e) => e?.match(/\d+/))
          .filter((match) => match !== null)
          .map((match) => match[0])[0];
      }
    }

    return order;
  }

  private extractTitle(document: Document): string {
    const field245: string[] = this.xpathQuery(
      document,
      this.XPATH_QUERY_245_TITLE
    );
    return field245.join(' ');
  }

  private extractYear(document: Document): number {
    const year: string[] = this.xpathQuery(document, this.XPATH_QUERY_008_YEAR);
    return year[0] ? Number(year[0].substring(7, 11)) : 0;
  }

  private extractEdition(document: Document): string {
    const edition: string[] = this.xpathQuery(
      document,
      this.XPATH_QUERY_250_EDITION
    );
    return edition[0] || '';
  }

  private extractHoldings(document: Document): string[] {
    const holdingsA: string[] = this.xpathQuery(
      document,
      this.XPATH_QUERY_852_HOLDINGS_A
    );
    const holdingsB: string[] = this.xpathQuery(
      document,
      this.XPATH_QUERY_852_HOLDINGS_B
    );
    // if 852$a is not empty, take 852$a
    if (holdingsA.length > 0 && holdingsB.length === 0) {
      return holdingsA;
    }
    // if 852$a is empty, take 852$b
    if (holdingsA.length === 0 && holdingsB.length > 0) {
      return holdingsB;
    }
    // if 852$a and 852$b are not empty, take 852$a
    return holdingsA;
  }

  private extractAnalytical(document: Document): boolean {
    const leader: string[] = this.xpathQuery(
      document,
      this.XPATH_QUERY_LEADER_ANALYTICAL
    );
    if (leader.length == 1) {
      const ldr7: string = leader[0].substring(7, 8);
      return ldr7 == 'a';
    }
    return false;
  }

  private extractAdditional(document: Document): Map<string, string> {
    const resultMap: Map<string, string> = new Map<string, string>();
    this.XPATH_QUERY_ADDITIONAL.forEach((query, key) => {
      const result: string[] = this.xpathQuery(document, query);
      resultMap.set(key, result.join(', '));
    });
    return resultMap;
  }

  getNumberOfRecords(xmlString: string): number {
    const fullDocument: Document = new DOMParser().parseFromString(
      xmlString,
      'text/xml'
    );
    const numberOfRecordsElement: Element | null = fullDocument
      .getElementsByTagName('numberOfRecords')
      ?.item(0);
    if (numberOfRecordsElement) {
      return Number(numberOfRecordsElement.textContent);
    }
    return 0;
  }

  getNextRecordPosition(xmlString: string): number {
    const fullDocument: Document = new DOMParser().parseFromString(
      xmlString,
      'text/xml'
    );
    const nextRecordPositionElement: Element | null = fullDocument
      .getElementsByTagName('nextRecordPosition')
      ?.item(0);
    if (nextRecordPositionElement) {
      return Number(nextRecordPositionElement.textContent);
    }
    return 0;
  }

  private xpathQuery(document: Document, query: string): string[] {
    const queryResult: XPathResult = this.evaluateXPath(query, document);
    const collectedResults: string[] = [];
    let resultNode: Node | null = queryResult.iterateNext();
    while (resultNode != null) {
      collectedResults.push(resultNode.textContent ?? '');
      resultNode = queryResult.iterateNext();
    }
    return collectedResults;
  }

  private extractRecords(xmlString: string): Document {
    const fullDocument: Document = new DOMParser().parseFromString(
      xmlString,
      'text/xml'
    );
    const recordElements: HTMLCollectionOf<Element> =
      fullDocument.getElementsByTagNameNS(
        SruResponseParserService.RECORD_NS,
        'record'
      );

    const recordsDocument: Document = new Document();
    const recordsElement: Element = recordsDocument.createElement('records');
    recordsDocument.append(recordsElement);
    Array.from(recordElements).forEach((record) =>
      recordsElement.append(record)
    );

    return recordsDocument;
  }

  private evaluateXPath(query: string, xmlDocument: Document) {
    const xpe = new XPathEvaluator();
    return xpe.evaluate(
      query,
      xmlDocument,
      SruResponseParserService.NS_RESOLVER,
      XPathResult.ANY_TYPE
    );
  }
}
