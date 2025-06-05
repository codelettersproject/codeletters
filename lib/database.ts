import { Database } from "typesdk/database/postgres";

import { isProduction } from "@/utils";
import { HttpError } from "@/core/errors";


let db: Database | null = null;


export async function connect(datname?: string): Promise<Database> {
  try {
    const uri = new URL(process.env.POSTGRES_URL!);

    if(datname && datname !== uri.pathname.replace(/\//g, "")) {
      uri.pathname = `/${datname}`;
      process.env.POSTGRES_DB = datname;
    }

    if(!process.env.POSTGRES_DB) {
      process.env.POSTGRES_DB = uri.pathname.replace(/\//g, "");
    }

    if(isProduction())
      return new Database(uri.toString());

    if(!db || !(await db.isOnline())) {
      db = new Database(uri.toString());
    }

    return db;
  } catch (err: any) {
    console.log(err);
    throw new HttpError("Database connection failed", err.message || String(err) || "Unknown error", null, { err })
      .hideUnsafeContext();
  }
}
