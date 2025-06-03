import r from "@/core/middlewares/r";
import { HttpError } from "@/core/errors";


async function handle() {
  throw new HttpError("This implementation is missing", null, null, { statusCode: 501 });
}


export default r(["GET"], handle);
