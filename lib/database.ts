import { Database } from "typesdk/database/postgres";

import { isProduction } from "@/utils";


let db: Database | null = null;


export async function connect(datname?: string): Promise<Database> {
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
}
