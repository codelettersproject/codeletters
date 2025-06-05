import { assert } from "@rapid-d-kit/safe";
import type { Mutable } from "@rapid-d-kit/types";


export interface ICookie {
  readonly value: string;
  readonly path?: string;
  readonly maxAge?: number;
  readonly domain?: string;
  readonly expires?: string;
  readonly sameSite?: "Strict" | "Lax" | "None";
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  readonly partitioned?: boolean;
  readonly priority?: "Medium" | "Low" | "High";
  readonly size?: number;
}


export class Cookie implements ICookie {
  public constructor(
    public readonly value: string,
    private _options?: Omit<Mutable<ICookie>, "value"> & { key?: string } // eslint-disable-line comma-dangle
  ) {
    this._options ??= {};

    if(!this._options.path) {
      this._options.path = "/";
    }

    if(typeof this._options.httpOnly !== "boolean") {
      this._options.httpOnly = true;
    }

    if(this._options.expires) {
      const date = new Date(this._options.expires);
      assert(!isNaN(date.getTime()) && date > new Date());
    }
  }

  public get domain(): string | undefined {
    return this._options?.domain;
  }

  public get path(): string | undefined {
    return this._options?.path;
  }

  public get expires(): string | undefined {
    return this._options?.expires;
  }

  public get maxAge(): number | undefined {
    return this._options?.maxAge;
  }

  public get sameSite(): "Strict" | "Lax" | "None" | undefined {
    return this._options?.sameSite;
  }

  public get secure(): boolean | undefined {
    return this._options?.secure;
  }

  public get httpOnly(): boolean | undefined {
    return this._options?.httpOnly;
  }

  public get partitioned(): boolean | undefined {
    return this._options?.partitioned;
  }

  public get priority(): "Medium" | "High" | "Low" | undefined {
    return this._options?.priority;
  }

  public getKey(): string | undefined {
    return this._options?.key;
  }

  public setKey(value: string | null | undefined): this {
    this._options ??= {};
    this._options.key = value || void 0;

    return this;
  }

  public toString(includeKey: boolean = false): string {
    let str = `${includeKey ? ("" + this._options?.key + "=") : ""}${this.value}`;

    if(this._options?.expires) {
      str += `; Expires=${new Date(this._options.expires).toUTCString()}`;
    }

    str += `; Path=${this._options?.path ?? "/"}`;
    
    if(this._options?.httpOnly !== false) {
      str += "; HttpOnly";
    }

    if(this._options?.domain) {
      str += `; Domain=${this._options.domain}`;
    }

    if(this._options?.maxAge) {
      str += `; Max-Age=${this._options.maxAge}`;
    }

    if(this._options?.sameSite) {
      str += `; SameSite=${this._options.sameSite}`;
    }

    if(this._options?.secure) {
      str += "; Secure";
    }

    if(this._options?.partitioned) {
      str += "; Partitioned";
    }

    if(this._options?.priority) {
      str += `; Priority=${this._options.priority}`;
    }

    return str;
  }
}
