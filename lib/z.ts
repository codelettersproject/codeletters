import * as zlib from "node:zlib";
import { chunkToBuffer } from "ndforge";
import type { BufferLike } from "@rapid-d-kit/types";
import { Readable as ReadableStream } from "node:stream";
import { CancellationToken, ICancellationToken } from "@rapid-d-kit/async";
import { Readable as ReadableSource, isReadable, isReadableStream } from "ndforge/stream";

import { Exception } from "@/core/errors";
import { parseBufferEncoding } from "@/utils";
import { BufferWriter, IReader } from "@/core/buffered/protocol";


const COMPRESSED_PACKET_MAGIC_HEADER = Buffer.from([
  49, 46, 88,
  122, 76, 67,
]);

const enum Z_BITFLAGS {
  NO_LENGTH_FOR_COMPRESSION = 0x0,
  Z_COMPRESSION_X = 0xF,
}

const balancedZlibOptions: zlib.ZlibOptions = {
  level: 6,
  strategy: zlib.constants.Z_DEFAULT_STRATEGY,
  memLevel: 8,
};


export interface ZOptions {
  token?: ICancellationToken;
  zlibExtendedOptions?: zlib.ZlibOptions;
}


export function createCompressedPacket(
  source: BufferLike | ReadableSource<BufferLike> | ReadableStream | IReader,
  options?: ZOptions
): Promise<Buffer>;

export function createCompressedPacket(
  source: BufferLike | ReadableSource<BufferLike> | ReadableStream | IReader,
  outputEncoding: BufferEncoding,
  options?: ZOptions,
): Promise<string>;

export function createCompressedPacket(
  source: BufferLike | ReadableSource<BufferLike> | ReadableStream | IReader,
  outputEncodingOrOptions?: BufferEncoding | ZOptions,
  options?: ZOptions // eslint-disable-line comma-dangle
): Promise<Buffer | string> {
  const o = typeof outputEncodingOrOptions === "string" ?
    options :
    outputEncodingOrOptions;

  const token = o?.token ?? CancellationToken.None;

  if(token.isCancellationRequested) {
    throw new Exception("Packet compression was cancelled by token", "ERR_TOKEN_CANCELLED");
  }

  const writer = new BufferWriter();

  if(isReadableStream(source)) return new Promise((resolve, reject) => {
    token.onCancellationRequested(reject);

    source.on("error", err => {
      writer.drain();
      reject(err);
    });

    source.on("end", () => {
      const buffer = writer.drain();

      if(buffer.byteLength < 384) {
        const header = Buffer.alloc(COMPRESSED_PACKET_MAGIC_HEADER.length + 1);

        COMPRESSED_PACKET_MAGIC_HEADER.copy(header, 0, 0);
        header[COMPRESSED_PACKET_MAGIC_HEADER.length] = Z_BITFLAGS.NO_LENGTH_FOR_COMPRESSION;

        resolve( parseBufferEncoding(Buffer.concat([header, buffer]), outputEncodingOrOptions) );
        return;
      }

      const header = Buffer.alloc(COMPRESSED_PACKET_MAGIC_HEADER.length + 1);

      COMPRESSED_PACKET_MAGIC_HEADER.copy(header, 0, 0);
      header[COMPRESSED_PACKET_MAGIC_HEADER.length] = Z_BITFLAGS.Z_COMPRESSION_X;

      zlib.deflate(buffer,
        Object.assign({}, balancedZlibOptions, o?.zlibExtendedOptions),
        (err, output) => {
          if(token.isCancellationRequested) 
            return reject(new Exception("Packet compression was cancelled by token", "ERR_TOKEN_CANCELLED"));

          if(!err)
            return resolve( parseBufferEncoding(Buffer.concat([header, output]), outputEncodingOrOptions) );

          reject(err);
        } );
    });

    source.on("data", chunk => {
      writer.write(chunkToBuffer(chunk));
    });
  });

  if(isReadable(source)) {
    writer.write( chunkToBuffer( source.read() ) );
  } else if(typeof source === "object" && !!source && (source as unknown as IReader).__brand === "chunked_reader") {
    const s = source as unknown as IReader;

    if(!s.readable) {
      throw new Exception("This object is not readable", "ERR_INVALID_ARGUMENT");
    }

    while(s.readable) {
      writer.write(s.read());
    }
  } else {
    writer.write(chunkToBuffer(source));
  }

  const buffer = writer.drain();

  if(token.isCancellationRequested) {
    throw new Exception("Packet compression was cancelled by token", "ERR_TOKEN_CANCELLED");
  }

  if(buffer.byteLength < 384) {
    const header = Buffer.alloc(COMPRESSED_PACKET_MAGIC_HEADER.length + 1);

    COMPRESSED_PACKET_MAGIC_HEADER.copy(header, 0, 0);
    header.writeUint8(Z_BITFLAGS.NO_LENGTH_FOR_COMPRESSION, COMPRESSED_PACKET_MAGIC_HEADER.length);

    Promise.resolve( parseBufferEncoding(Buffer.concat([header, buffer]), outputEncodingOrOptions) );
  }

  return new Promise((resolve, reject) => {
    token.onCancellationRequested(reject);

    zlib.deflate(buffer,
      Object.assign({}, balancedZlibOptions, o?.zlibExtendedOptions),
      (err, output) => {
        if(token.isCancellationRequested)
          return reject(new Exception("Packet compression was cancelled by token", "ERR_TOKEN_CANCELLED"));

        // eslint-disable-next-line no-extra-boolean-cast
        if(!!err)
          return reject(err);

        const header = Buffer.alloc(COMPRESSED_PACKET_MAGIC_HEADER.length + 1);

        COMPRESSED_PACKET_MAGIC_HEADER.copy(header, 0, 0);
        header[COMPRESSED_PACKET_MAGIC_HEADER.length] = Z_BITFLAGS.Z_COMPRESSION_X;

        resolve( parseBufferEncoding(Buffer.concat([header, output]), outputEncodingOrOptions) );
      });
  });
}



export function decompressPacket(
  packet: BufferLike | ReadableSource<BufferLike> | ReadableStream | IReader,
  options?: ZOptions
): Promise<Buffer>;

export function decompressPacket(
  packet: BufferLike | ReadableSource<BufferLike> | ReadableStream | IReader,
  outputEncoding: BufferEncoding,
  options?: ZOptions
): Promise<string>;

export async function decompressPacket(
  packet: BufferLike | ReadableSource<BufferLike> | ReadableStream | IReader,
  outputEncodingOrOptions?: BufferEncoding | ZOptions,
  options?: ZOptions // eslint-disable-line comma-dangle
): Promise<Buffer | string> {
  const o = typeof outputEncodingOrOptions === "string" ? options : outputEncodingOrOptions;
  const encoding = typeof outputEncodingOrOptions === "string" ? outputEncodingOrOptions : undefined;

  const token = o?.token ?? CancellationToken.None;

  if(token.isCancellationRequested) {
    throw new Exception("Packet decompression was cancelled by token", "ERR_TOKEN_CANCELLED");
  }

  const writer = new BufferWriter();

  if(isReadableStream(packet)) {
    await new Promise((resolve, reject) => {
      token.onCancellationRequested(reject);

      packet.on("error", reject);
      packet.on("end", resolve);

      packet.on("data", chunk => {
        writer.write( chunkToBuffer( chunk ) );
      });
    });
  } else if(isReadable(packet)) {
    writer.write( chunkToBuffer( packet.read() ) );
  } else if(typeof packet === "object" && !!packet && (packet as unknown as IReader).__brand === "chunked_reader") {
    const p = packet as unknown as IReader;

    if(!p.readable) {
      throw new Exception("This object is not readable", "ERR_INVALID_ARGUMENT");
    }

    while(p.readable) {
      writer.write(p.read());
    }
  } else {
    writer.write(chunkToBuffer(packet));
  }

  const buffer = writer.drain();

  if(buffer.length < COMPRESSED_PACKET_MAGIC_HEADER.length + 1) {
    throw new Exception("This packet is too short to be a compressed buffer", "ERR_INVALID_ARGUMENT");
  }

  const header = buffer.subarray(0, COMPRESSED_PACKET_MAGIC_HEADER.length);
  const payload = buffer.subarray(COMPRESSED_PACKET_MAGIC_HEADER.length + 1);
  const flag = buffer.readUint8(COMPRESSED_PACKET_MAGIC_HEADER.length);

  if(!header.equals(COMPRESSED_PACKET_MAGIC_HEADER)) {
    throw new Exception("Cannot ensure this buffer is a compressed packet", "ERR_MAGIC_NUMBER_MISMATCH");
  }

  if(flag === Z_BITFLAGS.NO_LENGTH_FOR_COMPRESSION)
    return Promise.resolve(parseBufferEncoding(payload, encoding));

  if(flag === Z_BITFLAGS.Z_COMPRESSION_X) return new Promise((resolve, reject) => {
    token.onCancellationRequested(reject);

    zlib.inflate(payload, Object.assign({}, balancedZlibOptions, o?.zlibExtendedOptions), (err, result) => {
      if(token.isCancellationRequested)
        return reject(new Exception("Packet compression was cancelled by token", "ERR_TOKEN_CANCELLED"));
        
      if(!err)
        return resolve(parseBufferEncoding(result, encoding));
          
      reject(err);
    });
  });

  throw new Exception("Unknown compression flag", "ERR_UNKNOWN_ERROR");
}
