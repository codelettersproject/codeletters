import { randomBytes } from "node:crypto";
import type { BufferLike } from "@rapid-d-kit/types";
import { chunkToBuffer, deriveKey, generateRandomBytes } from "ndforge";

import { isBase64 } from "@/utils";
import { Exception } from "../errors";
import { Either, left, right } from "../either";


class Password {
  #password: Buffer;
  #hashed: boolean;
  readonly #salt: Buffer;

  private constructor(
    passwd: BufferLike,
    hashed: boolean,
    salt: BufferLike // eslint-disable-line comma-dangle
  ) {
    if(isBase64(passwd)) {
      this.#password = Buffer.from(passwd, "base64");
    } else {
      this.#password = chunkToBuffer(passwd);
    }

    if(isBase64(salt)) {
      this.#salt = Buffer.from(salt, "base64");
    } else {
      this.#salt = chunkToBuffer(salt);
    }

    this.#hashed = hashed === true;
  }

  public get isHashed(): boolean {
    return this.#hashed;
  }

  public getHashedValue(): Promise<Buffer>;
  public getHashedValue(e: BufferEncoding): Promise<string>;
  public async getHashedValue(e?: BufferEncoding): Promise<Buffer | string> {
    if(this.#hashed) {
      const buffer = Buffer.alloc(this.#password.byteLength);
      this.#password.copy(buffer, 0, 0);

      return e && Buffer.isEncoding(e) ?
        buffer.toString(e) :
        buffer;
    }

    const hashed = await deriveKey("pbkdf2", this.#salt, this.#password, {
      iterations: 100000,
    });

    this.#password = null!;
    this.#password = Buffer.alloc(hashed.byteLength);

    hashed.copy(this.#password, 0, 0);
    this.#hashed = true;

    return e && Buffer.isEncoding(e) ?
      hashed.toString(e) :
      hashed;
  }

  public getSalt(): Buffer {
    const buffer = Buffer.alloc(this.#salt.byteLength);
    this.#salt.copy(buffer);

    return buffer;
  }

  public async compare(plainTextPassword: BufferLike): Promise<boolean> {
    let buffer: Buffer;

    if(isBase64(plainTextPassword)) {
      buffer = Buffer.from(plainTextPassword, "base64");
    } else {
      buffer = chunkToBuffer(plainTextPassword);
    }

    if(!this.#hashed)
      return buffer.equals(this.#password);

    const calcualtedHash = await deriveKey("pbkdf2", this.#salt, buffer, {
      iterations: 100000,
    });

    return calcualtedHash.equals(this.#password);
  }

  public static validate(value: string): boolean {
    return typeof value === "string" && value.trim().length >= 6;
  }

  public static create(value: BufferLike, hashed: boolean, salt?: BufferLike | null): Either<Exception, Password> {
    try {
      if(!Password.validate(chunkToBuffer(value).toString("utf-8"))) {
        throw new Exception("The provided password is not valid");
      }

      if(!salt) {
        salt = randomBytes(64);
      }

      return right(new Password(value, hashed, salt));
    } catch (err: any) {
      let e = err;

      if(!(err instanceof Exception)) {
        e = new Exception(err.message ?? String(err), void 0, err);
      }

      return left(e);
    }
  }

  public static async createAsync(value: BufferLike, hashed: boolean, salt?: BufferLike | null): Promise<Password> {
    if(!salt) {
      salt = await generateRandomBytes(64);
    }

    const result = Password.create(value, hashed, salt);

    if(result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }
}

export default Password;
