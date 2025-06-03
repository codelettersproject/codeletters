export type LooseObjectKeys<T extends object, X = T[keyof T]> = { [K in keyof T]?: T[K] } & { [key: string]: X };

export type UnitValue = { value: number; unit: string };

export type Dict<T> = {
  [key: string]: T;
};


export type LooseAutocomplete<T extends string | number | symbol> = T | Omit<string, T>;

export type JsonValue = string | number | boolean | null;
