import r from "@/core/middlewares/r";
import type { ApiRequest, ApiResponse } from "@/_types";


async function handle(rq: ApiRequest, rs: ApiResponse) {
  const dest = decodeURIComponent(String(rq.query.continue ?? "/dashboard"));

  rs.writeHead(302, {
    Location: dest,
    Connection: "close",
  }).end();
}


export default r(["GET"], handle);
