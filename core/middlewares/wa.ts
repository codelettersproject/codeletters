import { HttpError } from "../errors";
import { Cookie } from "@/lib/cookies";
import { isProduction } from "@/utils";
import Session from "@/models/sessions";
import type { RequestHandler } from "@/_types";
import { redact, unwrapRedacted } from "@/lib/crypto";


function wa(c: RequestHandler): RequestHandler {
  return async (rq, rs) => {
    if(!rq.rid) {
      throw new HttpError("Middleware was called in a invalid position of chain");
    }

    if(!rq.cookies["_CSID"]) {
      throw new HttpError("Unable to find your session", null, null, { status: 401 });
    }

    const psid = unwrapRedacted(rq.cookies["_CSID"], "utf-8", "base64url");
    const s = await Session.findById(psid);

    if(!s) {
      throw new HttpError("Unable to find your session", null, null, { status: 401 });
    }

    if(s.kind !== "authx" || s.headers.aud !== "usr") {
      throw new HttpError("The provided auth session is invalid", null, null, { statusCode: 403 });
    }

    const ns = await Session.create({
      kind: "authx",
      expires: "15m",
      userId: s.userId!,
      headers: s.headers,
      payload: s.payload,
    });

    await s.erase();

    const cookie = new Cookie(redact(ns.sessionId, "base64url"), {
      httpOnly: true,
      path: "/",
      sameSite: "Strict",
      secure: isProduction(),
    }).setKey("_CSID");

    ;(rq as any).ctx ??= {};
    ;(rq as any).ctx.session = ns.toRedactedDocument();

    let pc: string[] = rs.getHeader("Set-Cookie") as any;

    if(typeof pc === "string") {
      pc = [pc];
    } else if(!Array.isArray(pc)) {
      pc = [];
    }

    pc.push(cookie.toString(true));
    rs.setHeader("Set-Cookie", pc);

    await c(rq, rs);
  };
}

export default wa;
