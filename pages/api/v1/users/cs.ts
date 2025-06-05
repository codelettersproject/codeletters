import User from "@/models/users";
import r from "@/core/middlewares/r";
import wa from "@/core/middlewares/wa";
import { HttpError } from "@/core/errors";
import { transporter } from "@/lib/http";
import type { ApiRequest, ApiResponse } from "@/_types";


async function h(rq: ApiRequest, rs: ApiResponse): Promise<void> {
  if(!rq.ctx.session) {
    throw new HttpError("You must be authenticated to access this resource", null, null, { statusCode: 429 });
  }

  const usr = await User.find(rq.ctx.session.userId!);

  if(!usr) {
    throw new HttpError("You must be authenticated to access this resource", null, null, { statusCode: 401 });
  }

  const body = await transporter.encryptBuffer(usr.toSafeDocument());

  rs.status(200).send(body);
  rs.end();
}

export default r(["GET"], wa(h));
