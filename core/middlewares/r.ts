import { chunkToBuffer } from "ndforge";

import { uuidv7 } from "@/lib/uid";
import { transporter } from "@/lib/http";
import { HttpError, re } from "../errors";
import { jsonSafeParser } from "@/lib/safe-json";
import type { ApiRequest, Method, RequestHandler, RequestInet } from "@/_types";


function r(ms: Method | readonly Method[], c: RequestHandler): RequestHandler {
  return async (rq, rs) => {
    try {
      ;(rq as any).ctx = {}
      ;(rq as any).inet = i(rq);
      ;(rq as any).rid = uuidv7().toUpperCase()
      ;const m = rq.method?.toUpperCase() ?? "GET";

      if(!((Array.isArray(ms) ? ms : [ms]) as string[]).includes(m)) {
        rs.writeHead(405, { Connection: "close" }).end();
        return;
      }

      if(!["get", "options"].includes(rq.method?.toLowerCase() ?? "get")) {
        if(rq.headers["content-type"]?.startsWith("application/json")) {
          try {
            const db = await transporter.parseToken(typeof rq.body === "string" ? JSON.parse(rq.body) : rq.body);
            ;(rq as any).db = db;
          } catch (err) {
            const jsonParsed = jsonSafeParser(rq.body);

            if(jsonParsed.isRight()) {
              rq.body = jsonParsed.value;
              (rq as any).db = { __$raw: jsonParsed.value };
            }

            console.error(err, jsonParsed.isLeft() ? jsonParsed.value : null);
          }
        } else if(rq.headers["content-type"]?.startsWith("application/octet-stream")) {
          try {
            if(typeof rq.body === "string") {
              console.warn("[WARN] binary data in request like to be string encoded... Trying to parse as 'latin1'");
              rq.body = Buffer.from(rq.body, "latin1");
            } else if(!(rq.body instanceof Uint8Array)) {
              if(!rq.readable) {
                throw new HttpError("The request stream is not readable");
              }

              const chunks: Buffer[] = [];

              for await (const chunk of rq) {
                chunks.push(chunkToBuffer(chunk));
              }

              rq.body = Buffer.concat(chunks);
            }

            const db = await transporter.decryptBuffer(rq.body);
            ;(rq as any).db = db;
          } catch (err) {
            console.error(err);
          }
        }
      }
      
      await c(rq, rs);
    } catch (e: any) {
      await re(e, rq, rs);
    }
  };
}


function i(r: ApiRequest): RequestInet {
  const getHeader = (key: string): string | undefined => {
    if(r instanceof Request)
      return r.headers.get(key) ?? void 0;
    
    return (r.headers as Record<string, string>)[key];
  };

  let ipa: string | undefined = (
    getHeader("x-vercel-proxied-for")?.split(", ").at(-1) ||
    getHeader("x-vercel-forwarded-for")?.split(", ").at(-1) ||
    getHeader("x-real-ip")?.split(", ").at(-1) ||
    getHeader("x-forwarded-for")?.split(", ").at(-1)
  );

  if (!ipa || ipa === "::1") {
    ipa = "127.0.0.1";
  }

  if (ipa.slice(0, 7) === "::ffff:") {
    ipa = ipa.substring(7);
  }

  return {
    ipa,
    ipc: getHeader("x-vercel-ip-country")?.split(", ").at(-1) || void 0,
    ipcr: getHeader("x-vercel-ip-country-region")?.split(", ").at(-1) || void 0,
    ipct: getHeader("x-vercel-ip-city")?.split(", ").at(-1) || void 0,
    ipla: getHeader("x-vercel-ip-latitude")?.split(", ").at(-1) || void 0,
    iplo: getHeader("x-vercel-ip-longitude")?.split(", ").at(-1) || void 0,
    ipt: getHeader("x-vercel-ip-timezone")?.split(", ").at(-1) || void 0,
    ipp: getHeader("x-vercel-ip-postal-code")?.split(", ").at(-1) || void 0,
    iph: {
      tlip: ipa,
      vip: getHeader("x-vercel-forwarded-for")?.split(", ").at(-1),
    },
  };
}



export default r;
