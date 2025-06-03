import { shortId, uuidv7, longId } from "@/lib/uid";


abstract class Entity<TProps> {
  public static generateId(type?: "uuidv7" | "short" | "long" | "uuidv7-without-dashes"): string {
    switch(type) {
      case "short":
        return shortId();
      case "long":
        return longId();
      case "uuidv7":
        return uuidv7();
      case "uuidv7-without-dashes":
      default:
        return uuidv7().replace(/-/g, "");
    }
  }

  protected static _stringifyDate(input: any): string | undefined {
    if(input instanceof Date)
      return input.toISOString();

    return input ? String(input) : void 0;
  }
  
  protected readonly _id: string;
  
  public constructor(
    protected readonly _props: TProps,
    id?: string // eslint-disable-line comma-dangle
  ) {
    this._id = id || Entity.generateId();
  }

  public get id(): string {
    return this._id.slice(0);
  }

  public equals(object?: Entity<TProps>): boolean {
    if(object === null || object === undefined) return false;

    if(this === object) return true;

    if(!(object instanceof Entity)) return false;

    return this._id === object._id;
  }
}


export default Entity;
