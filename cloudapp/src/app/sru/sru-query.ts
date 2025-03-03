export class SruQuery {
  static QUERY: string = 'query';

  private static MMS_ID_DEF: QueryDefinition = {
    index: 'mms_id',
    operator: '=',
  };
  private static OTHER_SYSTEM_NUMBER_DEF: QueryDefinition = {
    index: 'other_system_number',
    operator: '==',
  };
  private static OTHER_SYSTEM_NUMBER_ACTIVE_35a_DEF: QueryDefinition = {
    index: 'other_system_number_active_035',
    operator: '==',
  };

  private query: string[];
  private _name: string;
  public get name(): string {
    return this._name;
  }

  constructor() {
    this.query = [];
  }

  get(): string {
    return this.query.join(' ');
  }

  or(query: SruQuery): SruQuery {
    if (query.getQueryParts().length > 0) {
      this.query.push(BoolOp.OR);
      this.query = this.query.concat(query.getQueryParts());
    }
    return this;
  }

  private getQueryParts(): string[] {
    return this.query;
  }

  private setName(name: string): SruQuery {
    this._name = name;
    return this;
  }

  private addQuery(def: QueryDefinition, value: string): SruQuery {
    const part: string = def.index + def.operator + value;
    this.query.push(part);
    return this;
  }

  private addBoolOp(op: BoolOp): SruQuery {
    this.query.push(op);
    return this;
  }

  static MMS_ID(value: string): SruQuery {
    return new SruQuery()
      .addQuery(SruQuery.MMS_ID_DEF, value)
      .setName('query for mmsid');
  }

  static MMS_IDS(values: string[]): SruQuery {
    return SruQuery.orListQuery(values, SruQuery.MMS_ID_DEF, 'query for mmsid');
  }

  static OTHER_SYSTEM_NUMBER(values: string[]): SruQuery {
    return SruQuery.orListQuery(
      values,
      SruQuery.OTHER_SYSTEM_NUMBER_DEF,
      "query for 'other_system_number'"
    );
  }

  static OTHER_SYSTEM_NUMBER_ACTIVE_035(values: string[]): SruQuery {
    return SruQuery.orListQuery(
      values,
      SruQuery.OTHER_SYSTEM_NUMBER_ACTIVE_35a_DEF,
      "query for 'other_system_number_active_035'"
    );
  }

  private static orListQuery(
    values: string[],
    queryDef: QueryDefinition,
    name: string
  ): SruQuery {
    const query: SruQuery = new SruQuery();
    values.forEach((value, idx, arr) => {
      query.addQuery(queryDef, value);
      // dont add OR to the last element
      if (idx + 1 < arr.length) {
        query.addBoolOp(BoolOp.OR);
      }
    });
    query.setName(name);
    return query;
  }
}

enum BoolOp {
  AND = 'AND',
  OR = 'OR',
}

type QueryDefinition = {
  index: string;
  operator: string;
};
