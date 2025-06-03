import { generateRandomBytes } from "ndforge";
import type { BufferLike } from "@rapid-d-kit/types";
import { assertDefinedString } from "@rapid-d-kit/safe";

import sql from "@/lib/sql";
import { isNumber } from "@/utils";
import { connect } from "@/lib/database";
import { Exception } from "@/core/errors";
import Entity from "@/core/domain/entity";
import Password from "@/core/domain/password";
import EmailAddress from "@/core/domain/email";
import { redact, sign, unwrapRedacted } from "@/lib/crypto";
import type { Dict, JsonValue, LooseAutocomplete } from "@/_types";


export interface PresetUserMetadata {
  last_login_attempt?: number | null;
  last_failed_login_attempt?: number | null;
  failed_login_attempts?: number | null;
}

export type UserMetadata = PresetUserMetadata & Dict<JsonValue>;

export type UserDocument = {
  readonly userId: string;
  readonly displayName: string;
  readonly emailAddress: string;
  readonly password: string;
  readonly salt: string;
  readonly metadata: Readonly<UserMetadata>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly nukedAt?: string;
};


type UserProps = {
  displayName: string;
  emailAddress: string;
  password: string;
  salt?: string;
  metadata?: Partial<UserMetadata>;
  createdAt?: string;
  updatedAt?: string;
  nukedAt?: string;
};


class User extends Entity<UserProps> {
  private _changed: boolean;
  private readonly _metadata: Map<string, JsonValue>;

  private constructor(props: UserProps, id?: string) {
    super(props, id);

    this._changed = false;
    this._metadata = new Map();
  }

  public get userId(): string {
    return this._id;
  }

  public get displayName(): string {
    return this._props.displayName;
  }

  public get emailAddress(): EmailAddress {
    const e = EmailAddress.create(this._props.emailAddress);

    if(e.isLeft()) {
      throw e.value;
    }

    return e.value;
  }

  public set emailAddress(value: string) {
    const e = EmailAddress.create(value);

    if(e.isRight()) {
      this._props.emailAddress = e.value.value;
      this._changed = true;
    }
  }

  public get password(): Password {
    const pwd = Password.create(
      Buffer.from(this._props.password, "base64"),
      true,
      Buffer.from(this._props.salt!, "base64") // eslint-disable-line comma-dangle
    );

    if(pwd.isLeft()) {
      throw pwd.value;
    }

    return pwd.value;
  }

  public get salt(): Buffer {
    return Buffer.from(this._props.salt!, "base64");
  }

  public get metadata(): Readonly<UserMetadata> {
    return Object.freeze(Object.fromEntries(this._metadata.entries()));
  }

  public get createdAt(): Date {
    return new Date(this._props.createdAt!);
  }

  public get updatedAt(): Date {
    return new Date(this._props.updatedAt!);
  }

  public get nukedAt(): Date | null {
    return this._props.nukedAt ? new Date(this._props.nukedAt) : null;
  }

  public setMetadata<K extends keyof PresetUserMetadata>(
    key: LooseAutocomplete<K>,
    value: (K extends keyof PresetUserMetadata ? PresetUserMetadata[K] : JsonValue) | null // eslint-disable-line comma-dangle
  ): this {
    assertDefinedString(key);

    this._metadata.set(key, value ?? null);
    this._changed = true;
    
    return this;
  }

  public removeMetadata(key: LooseAutocomplete<keyof PresetUserMetadata>): this {
    assertDefinedString(key);

    if(this._metadata.delete(key)) {
      this._changed = true;
    }

    return this;
  }

  public getMetadata<K extends keyof PresetUserMetadata>(
    key: LooseAutocomplete<K> // eslint-disable-line comma-dangle
  ): K extends keyof PresetUserMetadata ? PresetUserMetadata[K] : JsonValue {
    assertDefinedString(key);
    return (this._metadata.get(key) ?? null) as any;
  }

  public async updatePassword(plainTextPassword: BufferLike): Promise<void> {
    if( (await this.password.compare(plainTextPassword)) ) {
      throw new Exception("The new password for user cannot be equal to the current password");
    }

    const passwd = Password.create(plainTextPassword, false, this.salt);

    if(passwd.isLeft()) {
      throw passwd.value;
    }
    
    this._props.password = await passwd.value.getHashedValue("base64");
    this._changed = true;
  }

  public async update(): Promise<void> {
    if(!this._changed)
      return;

    const database = await connect();

    try {
      await database.transaction(async client => {
        await sql("users")
          .update({
            email_address: redact(this._props.emailAddress, "base64"),
            email_hash: sign(this._props.emailAddress, "hex"),
            password_digest: this._props.password,
            updated_at: new Date().toUTCString(),
          })
          .where({ user_id: this._id.slice(0) })
          .execute(client);

        await sql("user_metadata")
          .delete()
          .where({ user_id: this._id.slice(0) })
          .execute(client);

        for(const [key, value] of this._metadata.entries()) {
          if(key.trim().length === 0 || String(value).trim().length === 0)
            continue;
            
          await sql("user_metadata")
            .insert({ metadata_key: key, metadata_value: String(value), user_id: this._id.slice(0) })
            .execute(client);
        }
      });
    } finally {
      await database.close();
    }
  }

  public static async create(props: UserProps): Promise<User> {
    const email = EmailAddress.create(props.emailAddress);

    if(email.isLeft()) {
      throw email.value;
    }

    const salt = await generateRandomBytes(80);
    const passwd = Password.create(props.password, false, salt);

    if(passwd.isLeft()) {
      throw passwd.value;
    }

    const database = await connect();

    try {
      const tsNow = new Date().toUTCString();

      const { result, metadata } = await database.transaction(async client => {
        const password_digest = await passwd.value.getHashedValue("base64");

        const { rows } = await sql("users")
          .insert({
            user_id: User.generateId("long"),
            display_name: props.displayName,
            email_address: redact(email.value.value, "base64"),
            email_hash: sign(email.value.value, "hex"),
            password_digest,
            salt: salt.toString("base64"),
            created_at: tsNow,
            updated_at: tsNow,
          })
          .execute(client);

        const metadataEntries = Object.entries(props.metadata ?? {})
          .filter(([key]) => {
            return !["last_login_attempt", "last_failed_login_attempt", "failed_login_attempts"]
              .includes(key);
          });

        if(metadataEntries.length > 0) {
          for(const [key, value] of metadataEntries) {
            if(key.trim().length === 0 || String(value).trim().length === 0)
              continue;

            await sql("user_metadata")
              .insert({
                metadata_key: key,
                metadata_value: String(value),
                user_id: (<string>rows[0].user_id).slice(0),
              })
              .execute(client);
          }
        }

        return {
          result: { rows },
          metadata: Object.fromEntries(metadataEntries),
        };
      });

      return User.__new({
        rows: [
          {
            ...result.rows[0],
            metadata,
          },
        ],
      });
    } finally {
      await database.close();
    }
  }

  private static __new(result: { rows: any[] }): User {
    const metadata: Partial<UserMetadata> = {};

    if(Array.isArray(result.rows[0].metadata)) {
      for(let i = 0; i < result.rows[0].metadata.length; i++) {
        const [key, ...valueParts] = result.rows[0].metadata[i].split("|::|");
        const value = valueParts.join("|::|");

        if(value.toLowerCase() === "null") {
          metadata[key] = null;
        } else if(["true", "false"].includes(value.toLowerCase())) {
          metadata[key] = value.toLowerCase() === "true";
        } else if(isNumber(value)) {
          metadata[key] = Number(value);
        } else {
          metadata[key] = value;
        }
      }
    } else if(typeof result.rows[0].metadata === "object" && !!result.rows[0].metadata) {
      Object.assign(metadata, result.rows[0].metadata);
    }

    return new User({
      emailAddress: unwrapRedacted(result.rows[0].email_address, "utf-8", "base64"),
      password: result.rows[0].password_digest,
      salt: result.rows[0].salt,
      displayName: result.rows[0].display_name,
      createdAt: User._stringifyDate(result.rows[0].created_at),
      updatedAt: User._stringifyDate(result.rows[0].updated_at),
      nukedAt: User._stringifyDate(result.rows[0].nuked_at),
      metadata,
    }, result.rows[0].user_id);
  }
}

export default User;
