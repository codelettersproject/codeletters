import { re } from "../errors";
import { uuidv7 } from "@/lib/uid";
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
