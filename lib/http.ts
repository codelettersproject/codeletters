import powerfetch from "typesdk/http/powerfetch";
import { Transporter } from "ndforge/transporters/core";


if(!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not defined");
}

export const api = powerfetch.create(process.env.NEXT_PUBLIC_APP_URL, {
  credentials: "same-origin",
});


export const transporter = createTransporter();



function createTransporter(): Transporter {
  const ek = process.env.NEXT_PUBLIC_T_ENC_KEY;
  const sk = process.env.NEXT_PUBLIC_T_SIG_KEY;

  if(!ek || !sk) {
    throw new Error("NEXT_PUBLIC_T_ENC_KEY or NEXT_PUBLIC_T_SIG_KEY is not defined");
  }

  const te = new TextEncoder();
  return new Transporter(te.encode(ek), te.encode(sk));
}
