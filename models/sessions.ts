import { assert } from "@rapid-d-kit/safe";
import type { Dict } from "@rapid-d-kit/types";
import { IOStream, jsonSafeParser, jsonSafeStringify } from "ndforge";

import sql from "@/lib/sql";
import Entity from "@/core/domain/entity";
import { Exception } from "@/core/errors";
import type { JsonValue } from "@/_types";
import { connect } from "@/lib/database";
import { redact, sign, unwrapRedacted } from "@/lib/crypto";
import { parseRelativeTime, type RelativeTime } from "@/utils";
import { createCompressedPacket, decompressPacket } from "@/lib/z";
import { BufferReader, BufferWriter, deserialize, serialize } from "@/core/buffered/protocol";


export interface PresetSessionHeaders {
  "content-type": string;
  "content-length": number;
  compression: number;
}

export type SessionHeaders = PresetSessionHeaders & Dict<JsonValue>;


export type SessionDocument<T> = {
  readonly sessionId: string;
  readonly publicId: string;
  readonly kind: string;
  readonly headers: SessionHeaders;
  readonly payload: T;
  readonly signature: string;
  readonly tdi?: string;
  readonly userId?: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
};

export type SafeSessionDocument<T> = Omit<SessionDocument<T>, "headers" | "payload" | "signature">;


type SessionProps<T> = {
  payload: T;
  publicId?: string;
  kind: string;
  headers?: Partial<SessionHeaders>;
  userId?: string;
  signature?: string;
  tdi?: string;
  expires?: RelativeTime | Exclude<string, RelativeTime> | Date;
  createdAt?: string;
  options?: { avoidBufferCompression?: boolean };
};


class Session<T> extends Entity<SessionProps<T>> {
  private constructor(props: SessionProps<T>, id?: string) {
    super(props, id);
  }

  public get sessionId(): string {
    return this._id;
  }

  public get publicId(): string {
    return this._props.publicId!;
  }

  public get kind(): string {
    return this._props.kind;
  }

  public get headers(): SessionHeaders {
    return { ...(this._props.headers ?? {}) } as any;
  }

  public get payload(): T {
    return this._props.payload;
  }

  public get tdi(): string | null {
    return this._props.tdi ?? null;
  }

  public get userId(): string | null {
    return this._props.userId ?? null;
  }

  public get signature(): Buffer {
    return Buffer.from(this._props.signature!, "base64");
  }

  public get expiresAt(): Date | null {
    if(!this._props.expires)
      return null;

    return new Date(this._props.expires as string);
  }

  public get createdAt(): Date {
    return new Date(this._props.createdAt!);
  }

  public async generateToken(type: "jwt" | "opaque", expires?: number | RelativeTime | string | Date): Promise<string> {
    switch(type) {
      case "jwt": {
        throw new IOStream.Exception.NotImplemented("Session#generateToken([type=JWT])");
      } break;
      case "opaque": {
        throw new IOStream.Exception.NotImplemented("Session#generateToken([type=OPAQUE])", [expires]);
      } break;
      default:
        throw new Exception(`Unknown token kind specification "${type}"`, "ERR_INVALID_ARGUMENT");
    }
  }

  public async erase(): Promise<void> {
    const database = await connect();

    try {
      await database.transaction(async client => {
        await sql("sessions")
          .delete()
          .where({ user_id: this._id.slice(0) })
          .execute(client);

        for(const prop in this._props) {
          (this._props as any)[prop] = null!;
        }
      });
    } finally {
      await database.close();
    }
  }

  public doc(): SessionDocument<T> {
    return Object.freeze<SessionDocument<T>>({
      createdAt: this._props.createdAt!,
      headers: this._props.headers as any,
      kind: this._props.kind,
      payload: this._props.payload,
      publicId: this._props.publicId!,
      sessionId: this._id,
      tdi: this._props.tdi,
      signature: this._props.signature!,
      userId: this._props.userId,
      expiresAt: this._props.expires as string,
    });
  }

  public toRedactedDocument(): SafeSessionDocument<T> {
    return Object.freeze({
      createdAt: this._props.createdAt!,
      publicId: this._props.publicId!,
      sessionId: this._id,
      kind: this._props.kind,
      userId: this._props.userId,
      expiresAt: this._props.expires as string,
    });
  }

  public static async create<T>(props: SessionProps<T>): Promise<Session<T>> {
    const shouldCompress = props.options?.avoidBufferCompression !== true;

    const payloadWriter = new BufferWriter();
    serialize(payloadWriter, props.payload);

    const headers: SessionHeaders = {
      ...props.headers,
      compression: shouldCompress ? 1 : 0,
      "content-length": payloadWriter.byteLength,
      "content-type": `v8/typeof ${typeof props.payload}; enc=chunked-buffer`,
    };

    const signature = sign(`${jsonSafeStringify(headers)}:${payloadWriter.buffer.toString("utf8")}`, "base64");
    let buffer = redact(payloadWriter.buffer);

    if(shouldCompress) {
      buffer = await createCompressedPacket(buffer);
    }

    let expires_at: string | null = null;

    if(props.expires instanceof Date) {
      assert(props.expires > new Date(), "Session expiration time should be in the future");
      expires_at = props.expires.toUTCString();
    } else if(typeof props.expires === "string" && !!props.expires) {
      const d = new Date(props.expires);

      if(isNaN(d.getTime())) {
        expires_at = parseRelativeTime(props.expires as RelativeTime).toUTCString();
      } else {
        expires_at = d.toUTCString();
      }

      assert(new Date(expires_at) > new Date(), "Session expiration time should be in the future");
    }

    const database = await connect();

    try {
      const [query, values] = sql("sessions")
        .insert({
          session_id: Entity.generateId("long"),
          public_id: Entity.generateId("uuidv7"),
          user_id: props.userId ?? null,
          payload: buffer.toString("base64"),
          kind: props.kind.slice(0, 64),
          tdi: props.tdi ?? null,
          headers: redact(jsonSafeStringify(headers) ?? "{}", "base64"),
          created_at: new Date().toUTCString(),
          expires_at,
          signature,
        })
        .return();

      const result = await database.query(query, { values });

      return Session.__new<T>({
        rows: [
          {
            ...result.rows[0],
            headers,
            payload: payloadWriter.drain(),
          },
        ],
      });
    } finally {
      await database.close();
    }
  }

  public static async findById<T>(sessionId: string): Promise<Session<T> | null> {
    const database = await connect();

    try {
      const query = `SELECT
        *
      FROM
        sessions
      WHERE
        session_id = $1::TEXT
      OR
        public_id = $1::TEXT;`;
      
      const result = await database.query(query, { values: [sessionId] });

      if(result.rows.length !== 1)
        return null;

      const expiresAtString = Entity._stringifyDate(result.rows[0].expires_at);

      if(!!expiresAtString && new Date(expiresAtString) < new Date()) {
        const [deleteQuery, values] = sql("sessions")
          .delete()
          .where({ session_id: result.rows[0].session_id })
          .return();

        await database.query(deleteQuery, { values });

        throw new Exception("This session was expired", "ERR_RESOURCE_EXPIRED");
      }

      const headers = jsonSafeParser<SessionHeaders>(unwrapRedacted(
        result.rows[0].headers,
        "utf-8",
        "base64" // eslint-disable-line comma-dangle
      ));

      if(headers.isLeft()) {
        throw headers.value;
      }

      let payload: Buffer = Buffer.from(result.rows[0].payload, "base64");

      if(headers.value.compression === 1) {
        payload = await decompressPacket(payload);
      }

      payload = unwrapRedacted(payload);
      const signature = sign(`${jsonSafeStringify(headers.value)}:${payload.toString("utf8")}`);

      if(!signature.equals(Buffer.from(result.rows[0].signature, "base64"))) {
        const [deleteQuery, values] = sql("sessions")
          .delete()
          .where({ session_id: result.rows[0].session_id })
          .return();

        await database.query(deleteQuery, { values });

        throw new Exception("Couldn't validate the session signature", "ERR_INVALID_SIGNATURE");
      }

      return Session.__new({
        rows: [
          {
            ...result.rows[0],
            headers: headers.value,
            payload,
          },
        ],
      });
    } finally {
      await database.close();
    }
  }

  private static __new<T>(result: { rows: any[] }): Session<T> {
    assert(Buffer.isBuffer(result.rows[0].payload));
    const payload = deserialize<T>(new BufferReader(result.rows[0].payload));

    return new Session<T>({
      payload,
      tdi: result.rows[0].tdi,
      kind: result.rows[0].kind,
      headers: result.rows[0].headers,
      publicId: result.rows[0].public_id,
      signature: result.rows[0].signature,
      userId: result.rows[0].user_id,
      expires: Entity._stringifyDate(result.rows[0].expires_at),
      createdAt: Entity._stringifyDate(result.rows[0].created_at),
    }, result.rows[0].session_id);
  }
}

export default Session;
