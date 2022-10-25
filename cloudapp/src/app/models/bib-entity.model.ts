import { Entity } from '@exlibris/exl-cloudapp-angular-lib'
import { Observable } from 'rxjs/internal/Observable'

export class BibEntity {

	private _entity: Entity
	public get entity(): Entity {
		return this._entity
	}

	private _nzMmsId: Observable<string>
	public get nzMmsId(): Observable<string> {
		return this._nzMmsId
	}
	public set nzMmsId(value: Observable<string>) {
		this._nzMmsId = value
	}

	private _relatedRecords: Observable<number>
	public get relatedRecords(): Observable<number> {
		return this._relatedRecords
	}
	public set relatedRecords(value: Observable<number>) {
		this._relatedRecords = value
	}

	constructor(entity: Entity) {
		this._entity = entity
	}
}
