import { Injectable } from '@angular/core'
import { isNumber } from 'lodash'
import { BibInfo } from '../models/bib-info.model'

@Injectable({
	providedIn: 'root'
})
export class SruResponseParserService {
	private static readonly RECORD_NS: string = 'http://www.loc.gov/MARC21/slim'
	private static readonly NS_RESOLVER: XPathNSResolver = () => SruResponseParserService.RECORD_NS

	private readonly XPATH_QUERY_035a: string = "//default:datafield[@tag='035']/default:subfield[@code='a']"
	private readonly XPATH_QUERY_001_MMSID: string = "//default:controlfield[@tag='001']"
	private readonly XPATH_QUERY_800v_ORDER: string = "//default:datafield[@tag='800']/default:subfield[@code='v']"
	private readonly XPATH_QUERY_810v_ORDER: string = "//default:datafield[@tag='810']/default:subfield[@code='v']"
	private readonly XPATH_QUERY_830v_ORDER: string = "//default:datafield[@tag='830']/default:subfield[@code='v']"
	private readonly XPATH_QUERY_773g_ORDER: string = "//default:datafield[@tag='773']/default:subfield[@code='g']"
	private readonly XPATH_QUERY_245_TITLE: string = "//default:datafield[@tag='245']/default:subfield"
	private readonly XPATH_QUERY_008_YEAR: string = "//default:controlfield[@tag='008']"
	private readonly XPATH_QUERY_250_EDITION: string = "//default:datafield[@tag='250']/default:subfield"

	constructor() {
	}

	getRecords(xmlString: string): Element[] {
		const recordDocument: Document = this.extractRecords(xmlString)
		return Array.from(recordDocument.getElementsByTagName('record'))
	}

	getOtherSystemNumbers(records: Element[]): string[] {
		if (!records || records?.length == 0) {
			console.warn('No records - cannot query for other system numbers')
			return []
		}
		return records.map(record => {
			const tempDoc: Document = new Document()
			tempDoc.append(record)
			return this.xpathQuery(tempDoc, this.XPATH_QUERY_035a)
		}).reduce((acc, curr) => acc.concat(curr))
	}

	getBibInfo(records: Element[]): BibInfo[] {
		if (!records || records?.length == 0) {
			console.warn('No records - cannot query for bib info')
			return []
		}
		const bibInfos: BibInfo[] = records.map(record => {
			const singleRecordDocument: Document = new Document()
			singleRecordDocument.append(record)
			const mmsId: string = this.extractMmsId(singleRecordDocument)
			const order: number = this.extractOrder(singleRecordDocument)
			const title: string[] = this.xpathQuery(singleRecordDocument, this.XPATH_QUERY_245_TITLE)
			const year: string[] = this.xpathQuery(singleRecordDocument, this.XPATH_QUERY_008_YEAR)
			const edition: string[] = this.xpathQuery(singleRecordDocument, this.XPATH_QUERY_250_EDITION)
			return new BibInfo(
				mmsId, order, title[0], Number(year[0].substring(7, 11)), edition[0], true)
		})
		// find duplicates: https://stackoverflow.com/a/53212154
		return bibInfos
	}

	private extractMmsId(document: Document): string {
		const field001: string[] = this.xpathQuery(document, this.XPATH_QUERY_001_MMSID)
		return field001[0]
	}

	private extractOrder(document: Document): number {
		const field800v: string[] = this.xpathQuery(document, this.XPATH_QUERY_800v_ORDER)
		const field810v: string[] = this.xpathQuery(document, this.XPATH_QUERY_810v_ORDER)
		const field830v: string[] = this.xpathQuery(document, this.XPATH_QUERY_830v_ORDER)
		// take first number from one of the fields 800v/810v/830v
		let order: number = field800v.concat(field810v).concat(field830v)
			.map(entry => Number(entry))
			.find(entry => isFinite(entry))
		// if no number was found: try to extract from 773g
		if (!order) {
			const field773g: string[] = this.xpathQuery(document, this.XPATH_QUERY_773g_ORDER)
			order = field773g
				.filter(entry => entry.startsWith(':no'))
				.map(entry => entry.substring(':no'.length))
				.map(entry => Number(entry))
				.find(entry => isFinite(entry))
		}
		return order
	}

	getNumberOfRecords(xmlString: string): number {
		const fullDocument: Document = new DOMParser().parseFromString(xmlString, 'text/xml')
		const numberOfRecordsElement: Element = fullDocument.getElementsByTagName('numberOfRecords')?.item(0)
		if (numberOfRecordsElement) {
			return Number(numberOfRecordsElement.textContent)
		}
		return 0
	}

	getNextRecordPosition(xmlString: string): number {
		const fullDocument: Document = new DOMParser().parseFromString(xmlString, 'text/xml')
		const nextRecordPositionElement: Element = fullDocument.getElementsByTagName('nextRecordPosition')?.item(0)
		if (nextRecordPositionElement) {
			return Number(nextRecordPositionElement.textContent)
		}
		return 0
	}

	private xpathQuery(document: Document, query: string): string[] {
		const queryResult: XPathResult = this.evaluateXPath(query, document)
		const collectedResults: string[] = []
		let resultNode: Node = queryResult.iterateNext()
		while (resultNode != null) {
			collectedResults.push(resultNode.textContent)
			resultNode = queryResult.iterateNext()
		}
		return collectedResults
	}

	private extractRecords(xmlString: string): Document {
		const fullDocument: Document = new DOMParser().parseFromString(xmlString, 'text/xml')
		const recordElements: HTMLCollectionOf<Element> = fullDocument.getElementsByTagNameNS(SruResponseParserService.RECORD_NS, 'record')

		const recordsDocument: Document = new Document()
		const recordsElement: Element = recordsDocument.createElement('records')
		recordsDocument.append(recordsElement)
		Array.from(recordElements).forEach(record => recordsElement.append(record))

		return recordsDocument
	}

	private evaluateXPath(query: string, xmlDocument: Document) {
		const xpe = new XPathEvaluator()
		return xpe.evaluate(
			query,
			xmlDocument,
			SruResponseParserService.NS_RESOLVER,
			XPathResult.ANY_TYPE,
			null)
	}
}
