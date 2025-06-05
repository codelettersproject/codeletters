import { api } from "@/lib/http";


type R = Awaited<ReturnType<typeof api[keyof typeof api]>>;
type T = { kind: "warn" | "error"; msg: string };


async function toastifySignUpHttpError(res: R, l?: boolean): Promise<T> {
  const payload = await (res.headers["content-type"]?.includes("application/json") ?
    res.json<any>() :
    res.text()
  );

  const text = String(typeof payload === "string" ? payload : payload.message)
    .toLowerCase();

  if(l) {
    console.warn("AUTH:SIGN_UP", {payload,res});
  }

  if(res.status === 409) return {
    kind: "warn",
    msg: `Esse ${text.includes("email") ? "email" : "nome de usuário"} já existe`,
  };

  return { kind: "error", msg: "Algo não deu certo. Tente novamente" };
}


export function toastify(t: "signup:http", res: R, l: boolean = true): T | Promise<T> {
  switch(t) {
    case "signup:http":
      return toastifySignUpHttpError(res, l);
    default:
      return {
        kind: "error",
        msg: "Algo não deu certo. Tente novamente",
      };
  }
}
