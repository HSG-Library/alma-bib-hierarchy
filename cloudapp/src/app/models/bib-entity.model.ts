import { Entity } from '@exlibris/exl-cloudapp-angular-lib';
import { EMPTY } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

export class BibEntity {
  private _entity: Entity;
  private _relatedRecords: number | null = null;
  private _nzMmsId: Observable<string> = EMPTY;
  private _clicked: boolean = false;

  public get entity(): Entity {
    return this._entity;
  }
  public get nzMmsId(): Observable<string> {
    return this._nzMmsId;
  }
  public set nzMmsId(value: Observable<string>) {
    this._nzMmsId = value;
  }
  public get relatedRecords(): number | null {
    return this._relatedRecords;
  }
  public set relatedRecords(value: number | null) {
    this._relatedRecords = value;
  }
  public get clicked(): boolean {
    return this._clicked;
  }
  public set clicked(value: boolean) {
    this._clicked = value;
  }

  public constructor(entity: Entity) {
    this._entity = entity;
  }
}
