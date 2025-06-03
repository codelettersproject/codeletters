import { option } from "ndforge";


export function env(key: string): ReturnType<typeof option<string>> {
  return option(process.env[key]);
}
