import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { jsonSafeParser } from "ndforge/@internals/json";
import { createEnum, type EnumMembers } from "ndforge/object";

import type { Dict, LooseAutocomplete, LooseObjectKeys } from "@/_types";


export const PARSE_AS = createEnum("STRING", "INTEGER", "DECIMAL", "NUMERIC", "JSON_LITERAL", "BOOL");

type PrimitiveCastType<T extends string, TTarget = any> = (
  T extends "STRING" ?
  string :
  T extends "INTEGER" ?
  number :
  T extends "DECIMAL" ?
  number :
  T extends "NUMERIC" ?
  number :
  T extends "JSON_LITERAL" ?
  TTarget :
  T extends "BOOL" ?
  boolean : never
);

export interface QueryState<T extends object> {
  readonly query: Readonly<LooseObjectKeys<T, string | string[]>>;
  readonly size: number;

  castDefined<TJSON = any, K extends keyof T = keyof T, CType extends EnumMembers<typeof PARSE_AS> = EnumMembers<typeof PARSE_AS>>(key: LooseAutocomplete<K>, type: CType): PrimitiveCastType<CType, TJSON>;
  cast<TJSON = any, K extends keyof T = keyof T, CType extends EnumMembers<typeof PARSE_AS> = EnumMembers<typeof PARSE_AS>>(key: LooseAutocomplete<K>, type: CType): PrimitiveCastType<CType, TJSON> | undefined;
  set<K extends keyof T>(key: LooseAutocomplete<K>, value: string | string[]): void;
  remove<K extends keyof T>(key: LooseAutocomplete<K> | LooseAutocomplete<K>[]): void;
  update(query: LooseObjectKeys<T, string | string[]>): void;
  contains<K extends keyof T>(key: LooseAutocomplete<K>): boolean;
  toString(): string;
  refresh(): void;
  clear(): void;
}

export function useQueryState<T extends object>(): QueryState<T> {
  const router = useRouter();
  const [query, setQuery] = useState<Dict<any>>(router.query);

  useEffect(() => {
    setQuery(router.query as T);
  }, [router.query]);

  const set = (key: string, value: string | string[]) => {
    const newQuery = { ...query, [key]: value };
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });

    setQuery(newQuery as T);
  };

  const remove = (key: string | string[]) => {
    const newQuery = { ...query } as Dict<any>;
    
    if(Array.isArray(key)) {
      for(const k of key) {
        delete newQuery[k];
      }
    } else {
      delete newQuery[key];
    }

    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
    setQuery(newQuery as T);
  };

  const update = (newQuery: Dict<string | string[]>) => {
    const q = { ...query, ...newQuery };

    Object.keys(q).forEach(key => {
      if(!q[key]) {
        delete q[key];
      }
    });

    router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true });
    setQuery(q as T);
  };

  const clear = () => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
    setQuery({} as T);
  };

  const contains = (key: string) => {
    return key in query && !!query[key];
  };

  const toString = () => {
    const params = new URLSearchParams();

    for(const prop in query) {
      if(!query[prop])
        continue;

      for(const v of Array.isArray(query[prop]) ? query[prop] : [query[prop]]) {
        params.set(prop, v);
      }
    }

    return params.toString();
  };

  function cast(key: string, type: EnumMembers<typeof PARSE_AS>): any {
    if(!contains(key)) return undefined;
    const value = decodeURIComponent(query[key]);

    switch(type) {
      case PARSE_AS.STRING:
        return value;
      case PARSE_AS.BOOL:
        return value.toLowerCase() === "true";
      case PARSE_AS.NUMERIC:
        return Number(value);
      case PARSE_AS.INTEGER: {
        const parsed = Number(value);

        if(!Number.isInteger(parsed)) return undefined;
        return parsed;
      } break;
      case PARSE_AS.DECIMAL: {
        const parsed = Number(value);
        
        if(Number.isInteger(parsed)) return undefined;
        return parsed;
      } break;
      case PARSE_AS.JSON_LITERAL:
        return jsonSafeParser(value) || undefined;
      default:
        return undefined;
    }
  }

  function castDefined(key: string, type: EnumMembers<typeof PARSE_AS>): any {
    const parsed = cast(key, type);

    if(!parsed) {
      throw new Error(`Undefined query param '${key}'`);
    }

    return parsed;
  }

  return Object.freeze({
    query: Object.freeze(query),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    size: Object.entries(query).reduce((acc, [_, value]) => {
      acc += (Array.isArray(value) ? value.length : 1);
      return acc;
    }, 0),
    refresh: () => {
      setQuery(router.query as T);
    },
    cast,
    castDefined,
    set,
    remove,
    update,
    clear,
    contains,
    toString,
  } as const) as any;
}

export default useQueryState;
