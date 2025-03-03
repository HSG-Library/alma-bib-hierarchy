export class BibInfo {
  // 001
  private _mmsId: string;
  public get mmsId(): string {
    return this._mmsId;
  }
  // "773$$q or 830$$v"
  private _order: string;
  public get order(): string {
    return this._order;
  }
  private _title: string;
  public get title(): string {
    return this._title;
  }
  private _year: number;
  public get year(): number {
    return this._year;
  }
  private _edition: string;
  public get edition(): string {
    return this._edition;
  }
  private _holdings: string[];
  public get holdings(): string[] {
    return this._holdings;
  }
  private _analytical: boolean;
  public get analytical(): boolean {
    return this._analytical;
  }
  private _duplicates: string[];
  public get duplicates(): string[] {
    return this._duplicates;
  }
  private _additionalInfo: Map<string, string>;
  public get additionalInfo(): Map<string, string> {
    return this._additionalInfo;
  }

  constructor(
    mmsId: string,
    order: string,
    title: string,
    year: number,
    edition: string,
    holdings: string[],
    analytical: boolean,
    additionalInfo: Map<string, string>,
    duplicates?: string[]
  ) {
    this._mmsId = mmsId;
    this._order = order;
    this._title = title;
    this._year = year;
    this._edition = edition;
    this._holdings = holdings;
    this._analytical = analytical;
    this._additionalInfo = additionalInfo;
    this._duplicates = duplicates;
  }
}
