export class BibInfo {

	// 001
	private _mmsId: string
	public get mmsId(): string {
		return this._mmsId
	}
	// "773$$q or 830$$v"
	private _order: number
	public get order(): number {
		return this._order
	}
	private _title: string
	public get title(): string {
		return this._title
	}
	private _year: number
	public get year(): number {
		return this._year
	}
	private _edition: string
	public get edition(): string {
		return this._edition
	}
	private _holdings: string[]
	public get holdings(): string[] {
		return this._holdings
	}
	private _sameAs: string[]
	public get sameAs(): string[] {
		return this._sameAs
	}

	constructor(mmsId: string, order: number, title: string, year: number, edition: string, holdings: string[], sameAs?: string[]) {
		this._mmsId = mmsId
		this._order = order
		this._title = title
		this._year = year
		this._edition = edition
		this._holdings = holdings
		this._sameAs = sameAs
	}
}
