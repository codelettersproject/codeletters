import type { Dict } from "@rapid-d-kit/types";
import { IDisposable } from "@rapid-d-kit/disposable";
import { assert, assertUnsignedInteger } from "@rapid-d-kit/safe";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";

import { IInspectable } from "@/core/inspectable";


export function sql(table: string): SqlBuilder {
  return new SqlBuilder(table);
}


export type JoinKind = "JOIN" | "FULL OUTER JOIN" | "LEFT JOIN" | "RIGHT JOIN" | "INNER JOIN" | "CROSS JOIN";

type JoinClause = {
  kind: JoinKind;
  table: string;
  condition: string;
};

type DebugInspectProps = {
  table: string;
  alias: string;
  joins: JoinClause[];
  orderBy: string[];
  query: string;
  values: unknown[];
  limit: number | null;
  offset: number | null;
};


const joinKinds = ["JOIN", "FULL OUTER JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"];


class SqlBuilder implements IInspectable<DebugInspectProps>, IDisposable {
  private _combineWhereWith: "AND" | "OR" = "AND";

  private _table: string;
  private _tableAlias: string;
  private _joinClauses: JoinClause[] = [];
  private _whereClauses: string[] = [];
  private _orderByClauses: string[] = [];
  private _values: unknown[] = [];
  private _limit: number | null = null;
  private _offset: number | null = null;

  private _command: string | null = null;
  private _disposed: boolean = false;
  private _query: string = "";

  public constructor(_tablename: string) {
    assert(/^[a-zA-Z0-9_-]+$/.test(_tablename) || /^([a-zA-Z0-9_-]+)\s([a-zA-Z0-9_-]+)$/.test(_tablename));

    if(/\s+/.test(_tablename)) {
      const [tname, alias] = _tablename.split(/\s+/).map(item => item.trim());

      this._table = tname;
      this._tableAlias = alias;
    } else {
      this._table = _tablename.trim();
      this._tableAlias = this._table.charAt(0).toLowerCase();
    }
  }

  public get table(): string {
    return `${this._table} ${this._tableAlias}`;
  }

  public join(otherTable: string, condition: string, kind: JoinKind = "JOIN"): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(this._command === "SELECT", "Can only use join clauses with select command");

    assert(joinKinds.includes(kind));
    assert(/^[a-zA-Z0-9_-]+$/.test(otherTable) || /^([a-zA-Z0-9_-]+)\s([a-zA-Z0-9_-]+)$/.test(otherTable));

    if(/\s+/.test(otherTable)) {
      const [tname, alias] = otherTable.split(/\s+/).map(item => item.trim());

      this._joinClauses.push({
        kind,
        table: `${tname} ${alias}`,
        condition,
      });
    } else {
      const alias = otherTable.charAt(0).toLowerCase();

      this._joinClauses.push({
        kind,
        table: `${otherTable.trim()} ${alias}`,
        condition,
      });
    }

    return this;
  }

  public leftJoin(otherTable: string, condition: string): this {
    return this.join(otherTable, condition, "LEFT JOIN");
  }

  public rightJoin(otherTable: string, condition: string): this {
    return this.join(otherTable, condition, "RIGHT JOIN");
  }

  public fullOuterJoin(otherTable: string, condition: string): this {
    return this.join(otherTable, condition, "FULL OUTER JOIN");
  }

  public crossJoin(otherTable: string, condition: string): this {
    return this.join(otherTable, condition, "CROSS JOIN");
  }

  public innerJoin(otherTable: string, condition: string): this {
    return this.join(otherTable, condition, "INNER JOIN");
  }

  public limit(value: number): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(this._command === "SELECT", `Cannot use limit clauses with ${this._command} command`);
    assertUnsignedInteger(value);

    this._limit = value;
    return this;
  }

  public offset(value: number): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(this._command === "SELECT", `Cannot use offset clauses with ${this._command} command`);
    assertUnsignedInteger(value);

    this._offset = value;
    return this;
  }

  public where(condition: string | (Dict<unknown> & { $not?: Dict<unknown> })): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(this._command && ["SELECT", "UPDATE", "DELETE"].includes(this._command), `Cannot use where clauses with ${this._command} command`);

    if(typeof condition === "string") {
      this._whereClauses.push(condition.trim());
      return this;
    }

    let obj: any = condition;

    if("$not" in condition) {
      obj = condition.$not;
    }

    const entries = Object.entries(obj);

    for(let i = 0; i < entries.length; i++) {
      // eslint-disable-next-line prefer-const
      let [field, value] = entries[i];

      if(!field.includes(".") && !["UPDATE", "DELETE", "INSERT"].includes(this._command)) {
        field = `${this._tableAlias}.${field}`;
      }

      assert(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/.test(field) || /^[a-zA-Z0-9_-]+$/.test(field));

      this._whereClauses.push(`${"$not" in condition ? "NOT " : ""}${field}` + (value === null ? " IS NULL" : ` = $${this._values.length + i + 1}`));
      
      if(value !== null) {
        this._values.push(value);
      }
    }

    return this;
  }

  public orderBy(fields: Dict<"ASC" | "DESC">): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(this._command === "SELECT", `Cannot use order by clauses with ${this._command} command`);

    const entries = Object.entries(fields);

    for(let i = 0; i < entries.length; i++) {
      // eslint-disable-next-line prefer-const
      let [field, order] = entries[i];

      if(!field.includes(".")) {
        field = `${this._tableAlias}.${field}`;
      }

      assert(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/.test(field));
      this._orderByClauses.push(`${field} ${order === "ASC" ? "ASC" : "DESC"}`);
    }

    return this;
  }

  public select(...fields: readonly ["*"] | readonly string[]): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(!this._command, `The query builder is already initialized with a ${this._command} command`);

    this._command = "SELECT";
    this._query = `SELECT\n${fields.map(item => "  " + (item.includes(".") || _isReserved(item) ? "" : (this._tableAlias + ".")) + item.trim()).join(",\n")}\nFROM\n  ${this._table} ${this._tableAlias}`;

    return this;
  }

  public update(fields: Dict<unknown>): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(!this._command, `The query builder is already initialized with a ${this._command} command`);

    this._query = `UPDATE\n  ${this._table}\nSET`;
    this._command = "UPDATE";

    const entries = Object.entries(fields);

    for(let i = 0; i < entries.length; i++) {
      const [field, value] = entries[i];
      assert(/^[a-zA-Z0-9_-]+$/.test(field));

      this._query += `\n  ${field} = $${i + 1},`;
      this._values.push(value);
    }

    this._query = this._query.trim().replace(/,$/, "");
    return this;
  }

  public delete(): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(!this._command, `The query builder is already initialized with a ${this._command} command`);

    this._command = "DELETE";
    this._query = `DELETE FROM\n  ${this._table}`;

    return this;
  }

  public insert(thing: Dict<unknown> | readonly unknown[]): this {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(!this._command, `The query builder is already initialized with a ${this._command} command`);

    this._command = "INSERT";
    this._query = `INSERT INTO ${this._table}`;

    if(Array.isArray(thing)) {
      this._query += " VALUES (\n";
      
      for(let i = 0; i < thing.length; i++) {
        this._query += `  $${i + 1},\n`;
        this._values.push(thing[i]);
      }

      this._query = `${this._query.trim().replace(/,$/, "")}\n) RETURNING *`;
    } else {
      const entries = Object.entries(thing);

      this._query += " (\n";
      let values: string = "VALUES (\n";

      for(let i = 0; i < entries.length; i++) {
        const [field, value] = entries[i];

        this._query += `  ${field},\n`;
        values += `  $${i + 1},\n`;

        this._values.push(value);
      }

      values = values.trim().replace(/,$/, "") + "\n) RETURNING *";
      this._query = `${this._query.trim().replace(/,$/, "")}\n) ${values}`;
    }

    return this;
  }

  public $inspect(): DebugInspectProps {
    assert(!this._disposed, "This query builder instance is already disposed");

    return {
      alias: this._tableAlias.slice(0),
      query: this._query.slice(0),
      table: this._table.slice(0),
      orderBy: [ ...this._orderByClauses ],
      joins: [ ...this._joinClauses ],
      values: [ ...this._values ],
      limit: this._limit,
      offset: this._offset,
    };
  }

  public setWhereConstraint(value: "AND" | "OR"): this {
    assert(!this._disposed, "This query builder instance is already disposed");

    this._combineWhereWith = value === "OR" ? "OR" : "AND";
    return this;
  }

  public async execute<T extends QueryResultRow = Dict<unknown>>(client: { query: PoolClient["query"]; return?: boolean; }): Promise<QueryResult<T>> {
    assert(!this._disposed, "This query builder instance is already disposed");
    assert(!!this._command);
    
    try {
      return await client.query({
        text: this.toString(client.return),
        values: this._values,
      });
    } finally {
      this.dispose();
    }
  }

  public return(tryReturn?: boolean): readonly [string, unknown[]] {
    assert(!this._disposed, "This query builder instance is already disposed");
    const [query, values] = [this.toString(tryReturn), [...this._values]];
    
    this.dispose();
    return Object.freeze([query, values]);
  }

  public toString(tryReturn: boolean = false): string {
    assert(!this._disposed, "This query builder instance is already disposed");
    let q = this._query.trim();

    for(let i = 0; i < this._joinClauses.length; i++) {
      const join = this._joinClauses[i];
      q += `\n${join.kind}\n  ${join.table} ON ${join.condition}`;
    }

    if(this._whereClauses.length > 0) {
      q += `\nWHERE\n${this._whereClauses.map(item => "  " + item.trim()).join("\n" + this._combineWhereWith + "\n")}`;
    }

    if(this._orderByClauses.length > 0) {
      q += `\nORDER BY\n${this._orderByClauses.map(item => "  " + item).join(",\n")}`;
    }

    if(typeof this._limit === "number") {
      q += `\nLIMIT ${this._limit}`;
    }

    if(typeof this._offset === "number") {
      q += `\nOFFSET ${this._offset}`;
    }

    if(tryReturn) {
      q += "\nRETURNING *";
    }

    return q.endsWith(";") ? q : `${q};`;
  }

  public dispose(): void {
    if(this._disposed) return;

    this._table = null!;
    this._tableAlias = null!;
    this._joinClauses = null!;
    this._whereClauses = null!;
    this._orderByClauses = null!;
    this._values = null!;

    this._command = null;
    this._query = "";

    this._disposed = true;
  }

  public [Symbol.dispose](): void {
    this.dispose();
  }
}

function _isReserved(item: string): boolean {
  return item.toLowerCase().startsWith("count(");
}


export default sql;
