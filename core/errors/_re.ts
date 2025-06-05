import { IOStream } from "ndforge";

import HttpError from "./http";
import { ivhs } from "@/utils/http";
import { jsonSafeStringify } from "@/lib/safe-json";
import type { ApiRequest, ApiResponse } from "@/_types";


export async function re(c: any, rq: ApiRequest, rs: ApiResponse): Promise<void> {
  if(!c) {
    rs.writeHead(500, {
      Connection: "close",
    }).end();

    return;
  }
  
  process.stdout.write(JSON.stringify(c) + "\n");
  console.error(c);
  
  let s = gs(c);

  if(s === 500 && typeof c === "object" && "context" in c) {
    s = gs(c["context"]);
  }

  const o: Record<string, unknown> = {
    httpStatusCode: s,
    code: "ERR_UNKNOWN_ERROR",
    requestId: rq.rid ?? "[UNKNOWN]",
    message: c.unsafeContextMessage ?? c.message ?? String(c),
  };

  if(c instanceof HttpError) {
    o.code = c.code;
    o.message = c.unsafeContextMessage;
    o.context = c.context?.safeContext ?? c.context;

    if(!c.context?.safeContext && c.shouldHideUnsafeContext()) {
      delete o.context;
      o.message = c.unsafeContextMessage ?? "[REDACTED]";
    }
  } else if(c instanceof IOStream.Exception.NotImplemented) {
    o.code = "ERR_NOT_IMPLEMENTED";
    o.message = c.message;
    o.context = null;

    s = 501;
  }

  if((o as any).message.toUpperCase().includes("ECONNREFUSED")) {
    o.message = "[REDACTED]";
  }

  const d = jsonSafeStringify(o);
  rs.status(s);

  if(d.isRight()) {
    rs.setHeader("Content-Type", "application/json; charset=UTF-8");
    rs.setHeader("Content-Length", d.value.length);
    
    rs.send(d.value);
  }

  rs.end();
}

function gs(c: any): number {
  if(typeof c !== "object" || Array.isArray(c) || !c)
    return 500;

  if("statusCode" in c) {
    const cd = parseInt(c["statusCode"], 10);

    if(!isNaN(cd) && ivhs(cd))
      return cd;
  }

  if("httpStatusCode" in c) {
    const cd = parseInt(c["httpStatusCode"], 10);

    if(!isNaN(cd) && ivhs(cd))
      return cd;
  }

  for(const k in c) {
    if(typeof c[k] === "object" && !Array.isArray(c) && !!c) {
      const r = gs(c[k]);

      if(ivhs(r))
        return r;
    }
  }

  return 500;
}
