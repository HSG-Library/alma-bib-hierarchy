export class SruQuery {

	static QUERY: string = 'query'

	private static MMS_ID_DEF: QueryDefinition = { index: 'mms_id', operator: '=' }
	private static OTHER_SYSTEM_NUMBER_DEF: QueryDefinition = { index: 'other_system_number', operator: '=' }

	private query: string[]

	constructor() {
		this.query = []
	}

	get() {
		return this.query.join(' ')
	}

	private addQuery(def: QueryDefinition, value: string): SruQuery {
		const part: string = def.index + def.operator + value
		this.query.push(part)
		return this
	}

	private addBoolOp(op: BoolOp): SruQuery {
		this.query.push(op)
		return this
	}

	static MMS_ID(value: string): SruQuery {
		return new SruQuery()
			.addQuery(SruQuery.MMS_ID_DEF, value)
	}

	static OTHER_SYSTEM_NUMBER(values: string[]): SruQuery {
		const query: SruQuery = new SruQuery()
		values.forEach((value, idx, arr) => {
			query.addQuery(SruQuery.OTHER_SYSTEM_NUMBER_DEF, value)
			// dont add OR to the last element
			if (idx + 1 < arr.length) {
				query.addBoolOp(BoolOp.OR)
			}
		})
		return query
	}
}

enum BoolOp {
	AND = 'AND',
	OR = 'OR'
}

type QueryDefinition = {
	index: string,
	operator: string
}
