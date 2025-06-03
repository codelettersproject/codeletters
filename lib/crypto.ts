/* eslint-disable no-inner-declarations, @typescript-eslint/no-namespace */

import * as ms from "ms";
import * as crypto from "node:crypto";
import { chunkToBuffer } from "ndforge";
import type { BufferLike } from "@rapid-d-kit/types";
import { sign as sJWT, verify as vJWT, type Algorithm as JWTAlgorithm } from "jsonwebtoken";

import { env } from "./env";
import { Exception } from "@/core/errors";


export function redact(c: BufferLike): Buffer;
export function redact(c: BufferLike, e: BufferEncoding): string;
export function redact(c: BufferLike, e?: BufferEncoding): Buffer | string {
  const ek = env("K_ENC_KEY").unwrap_expect("Unable to find encryption key in current environment");

  const keyWrapEncoding = !!process.env.KEC_ENCODING && Buffer.isEncoding(process.env.KEC_ENCODING) ?
    process.env.KEC_ENCODING : void 0;

  const { master, iv } = CryptoKey.consume("aes-256-cbc", Buffer.from(ek, keyWrapEncoding));

  if(!iv) {
    throw new Exception("The encryption key in current environment is too short", "ERR_CRYPTO_SHORT_KEY");
  }

  const rc = crypto.createCipheriv("aes-256-cbc", master, iv);
  const r = Buffer.concat([rc.update(chunkToBuffer(c)), rc.final()]);

  return e && Buffer.isEncoding(e) ? r.toString(e) : r;
}

export function unwrapRedacted(c: BufferLike): Buffer;
export function unwrapRedacted(c: BufferLike, e: BufferEncoding): string;
export function unwrapRedacted(
  c: BufferLike,
  e: null | undefined,
  ie: BufferEncoding
): Buffer;

export function unwrapRedacted(
  c: BufferLike,
  e: BufferEncoding,
  ie: BufferEncoding
): string;

export function unwrapRedacted(
  c: BufferLike,
  e?: BufferEncoding | null,
  ie?: BufferEncoding | null // eslint-disable-line comma-dangle
): Buffer | string {
  const ek = env("K_ENC_KEY").unwrap_expect("Unable to find encryption key in current environment");

  const keyWrapEncoding = !!process.env.KEC_ENCODING && Buffer.isEncoding(process.env.KEC_ENCODING) ?
    process.env.KEC_ENCODING : void 0;

  const { master, iv } = CryptoKey.consume("aes-256-cbc", Buffer.from(ek, keyWrapEncoding));

  if(!iv) {
    throw new Exception("The encryption key in current environment is too short", "ERR_CRYPTO_SHORT_KEY");
  }

  const rd = crypto.createDecipheriv("aes-256-cbc", master, iv);

  const buffer = typeof c === "string" && !!ie
    ? Buffer.from(c, ie)
    : chunkToBuffer(c);

  const r = Buffer.concat([rd.update(buffer), rd.final()]);

  return e && Buffer.isEncoding(e) ?
    r.toString(e) :
    r;
}


export function sign(c: BufferLike): Buffer;
export function sign(c: BufferLike, e: crypto.BinaryToTextEncoding): string;
export function sign(c: BufferLike, e?: crypto.BinaryToTextEncoding): Buffer | string {
  const sk = env("K_SIGN_KEY").unwrap_expect("Unable to find sign key in current environment");

  const keyWrapEncoding = !!process.env.KSN_ENCODING && Buffer.isEncoding(process.env.KSN_ENCODING) ?
    process.env.KSN_ENCODING : void 0;

  const key = Buffer.from(sk, keyWrapEncoding);

  return crypto.createHmac("sha512", key)
    .update(chunkToBuffer(c))
    .digest(e!);
}



export namespace CryptoKey {
  export type PresetAlgorithm = 
    | "aes-128-cbc"
    | "aes-256-cbc"
    | "aes-128-gcm"
    | "aes-256-gcm"
    | "chacha20";

  export type LengthInfo = {
    length: number;
    ivLength?: number;
    authTagLength?: number;
  };
  
  export type KeyInfo = {
    master: Buffer;
    iv?: Buffer;
    authTag?: Buffer;
    left?: Buffer;
    byteLength: number;
  };

  export function consume(algorithm: PresetAlgorithm | LengthInfo, wrappedKey: BufferLike): KeyInfo {
    const buffer = chunkToBuffer(wrappedKey);
    const { length, ivLength = 0, authTagLength = 0 } = extractAlgorithmLength(algorithm);

    if (buffer.byteLength < length) {
      throw new Error(`Cannot consume a short key (${buffer.byteLength}) for algorithm '${typeof algorithm === "string" ? algorithm : "custom"}'`);
    }

    const master = buffer.subarray(0, length);

    const iv = ivLength > 0 && buffer.byteLength >= length + ivLength
      ? buffer.subarray(length, length + ivLength)
      : undefined;

    const authTag = authTagLength > 0 && buffer.byteLength >= length + ivLength + authTagLength
      ? buffer.subarray(length + ivLength, length + ivLength + authTagLength)
      : undefined;

    const left = buffer.byteLength > length + ivLength + authTagLength
      ? buffer.subarray(length + ivLength + authTagLength)
      : undefined;

    return {
      byteLength: buffer.byteLength,
      master,
      iv,
      authTag,
      left,
    };
  }

  export function extractAlgorithmLength(algorithm: PresetAlgorithm | LengthInfo): LengthInfo {
    if(typeof algorithm !== "string")
      return algorithm;

    switch(algorithm) {
      case "aes-128-cbc":
        return { length: 16, ivLength: 16 };
      case "aes-256-cbc":
        return { length: 32, ivLength: 16 };
      case "aes-128-gcm":
        return { length: 16, ivLength: 12, authTagLength: 16 };
      case "aes-256-gcm":
        return { length: 32, ivLength: 12, authTagLength: 16 };
      case "chacha20":
        return { length: 32, ivLength: 12 };
      default:
        throw new Exception(`An unknown encryption algorithm was received in some operation: e_no_cipher_${algorithm}`, "ERR_INVALID_ARGUMENT");
    }
  }
}


export namespace WebToken {
  export type TokenMetadata = {
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
  };

  export type Token<T> = TokenMetadata & { readonly payload: T };

  export const metadataKeys = Object.freeze([
    "iss",
    "sub",
    "aud",
    "exp",
    "nbf",
    "iat",
    "jti",
  ] as const);

  export function signJWT(payload: any, metadata?: TokenMetadata, options?: { algorithm?: JWTAlgorithm, expiresIn?: ms.StringValue | number }): string {
    const tk = env("TOKEN_KEY").unwrap_expect("Unable to find token key in current environment");

    const keyWrapEncoding = !!process.env.KWT_ENCODING && Buffer.isEncoding(process.env.KWT_ENCODING) ?
      process.env.KWT_ENCODING : void 0;

    const rawKey = Buffer.from(tk, keyWrapEncoding);

    const p: Record<string, any> = {
      ...metadata,
      __brand: "__t",
      payload,
    };

    for(const prop in p) {
      if(!p[prop]) {
        delete p[prop];
      }
    }

    const o: Record<string, any> = {
      expiresIn: options?.expiresIn,
      algorithm: options?.algorithm,
    };

    for(const prop in o) {
      if(!o[prop]) {
        delete o[prop];
      }
    }

    return sJWT(p, rawKey, o);
  }

  export function parseJWT<T>(token: string, algorithms?: JWTAlgorithm[]): Token<T> {
    const tk = env("TOKEN_KEY").unwrap_expect("Unable to find token key in current environment");

    const keyWrapEncoding = !!process.env.KWT_ENCODING && Buffer.isEncoding(process.env.KWT_ENCODING) ?
      process.env.KWT_ENCODING : void 0;

    const rawKey = Buffer.from(tk, keyWrapEncoding);
    const parsed = vJWT(token, rawKey, { algorithms });

    if(typeof parsed !== "object")
      return { payload: parsed as T };

    if(parsed.__brand !== "__t") {
      throw new Exception("Something was wrong with the web token");
    }

    const metadata: TokenMetadata = {};

    for(const prop of metadataKeys) {
      metadata[prop] = (parsed[prop] as any) ?? void 0;
      delete parsed[prop];
    }

    return {
      ...metadata,
      payload: parsed.payload ?? parsed,
    };
  }
}
