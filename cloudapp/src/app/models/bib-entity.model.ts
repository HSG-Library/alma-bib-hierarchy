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

	private _relatedRecords: number
	public get relatedRecords(): number {
		return this._relatedRecords
	}
	public set relatedRecords(value: number) {
		this._relatedRecords = value
	}

	constructor(entity: Entity) {
		this._entity = entity
	}
}
