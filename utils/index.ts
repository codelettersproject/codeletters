export * from "./time";
export * from "./http";
export * from "./react";
export * from "./object";



export function baseurl(): URL { /* eslint-disable no-extra-boolean-cast */
  if(!!process.env.NEXT_PUBLIC_APP_URL) return new URL(process.env.NEXT_PUBLIC_APP_URL);
  if(!!process.env.VERCEL_URL) return new URL(process.env.VERCEL_URL);
  if(!!process.env.NEXT_PUBLIC_VERCEL_URL) return new URL(process.env.NEXT_PUBLIC_VERCEL_URL);

  return new URL("http://127.0.0.1:4001");
} /* eslint-enable no-extra-boolean-cast */


export function isProduction(): boolean {
  const kind = "production";

  return (
    process.env.NODE_ENV === kind ||
    process.env.NEXT_PUBLIC_NEXT_ENV === kind ||
    process.env.VERCEL_ENV === kind ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === kind
  );
}


export function calculateAge(birthDate: Date | string): number {
  if(!(birthDate instanceof Date)) {
    birthDate = new Date(birthDate);
  }

  const diff = new Date().getTime() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function weakRemoveDuplicates<T extends Record<any, any>[]>(arr: T, key: keyof T[number]): T {
  return arr.filter((v, i, a) => a.findIndex(t => (t[key] === v[key])) === i) as T;
}

export function splitLastOccurrence<T extends string>(str: T, separator: string): [first: string, second?: string] {
  if(separator.length !== 1) {
    throw new Error("Separator must be a single character");
  }

  let index = -1;
  const s = separator.charCodeAt(0);

  for(let i = str.length - 1; i >= 0; i--) {
    if(str.charCodeAt(i) !== s) continue;

    index = i;
    break;
  }

  if(index < 0) return [str];

  return [
    str.slice(0, index),
    str.slice(index + 1),
  ];
}

export function inInterval(value: number, interval: readonly [number, number], margins: boolean = true): boolean {
  if(typeof value !== "number" || typeof interval[0] !== "number" || typeof interval[1] !== "number") {
    throw new TypeError();
  }

  if(margins)
    return value >= interval[0] && value <= interval[1];

  return value > interval[0] && value < interval[1];
}

export function strShuffle(str: string): string {
  if(typeof str !== "string") {
    throw new Error("Expected first argument to be 'typeof string'");
  }

  const arr = str.split("");

  // Loop through the array
  for(let i = arr.length - 1; i > 0; i--) {
    // Generate a random index
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the current element with the random element
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  // Convert the array back to a string and return it
  return arr.join("");
}

export function encodeUrlVariables<T extends object>(vars: T): string {
  if(!vars || typeof vars !== "object" || Array.isArray(vars)) {
    throw new TypeError();
  }

  const v = [] as string[];

  for(const prop in vars) {
    v.push(`${encodeURIComponent(prop)}=${encodeURIComponent((vars as any)[prop])}`);
  }

  return encodeURIComponent(btoa(v.join(",")));
}



// Encode to URL-safe Base64
export function encodeUrlSafeBase64(input: string) {
  // Replace characters to make it URL-safe
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Decode from URL-safe Base64
export function decodeUrlSafeBase64(input: string) {
  // Replace URL-safe characters back to standard Base64 characters
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  while(base64.length % 4 !== 0) {
    base64 += "=";
  }

  return atob(base64); // Standard Base64 decoding
}


export async function _sha256(message: string): Promise<string> {
  // Convert the message to a Uint8Array
  const msgBuffer = new TextEncoder().encode(message);

  // Hash the message using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // Convert ArrayBuffer to Array, then to hexadecimal format
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}


export function defined(arg: unknown): arg is NonNullable<typeof arg> {
  return (
    arg !== null &&
    arg !== undefined &&
    typeof arg !== "undefined" &&
    (typeof arg === "string" ? !!arg : true)
  );
}

export function percent(part: number, whole: number): number {
  return (part / whole) * 100;
}


export function delayed(callback: () => void, timeout?: number): NodeJS.Timeout | number {
  return setTimeout(callback, timeout || 750);
}


export function cdn(path: string): string {
  const base = process.env.NEXT_PUBLIC_CDN_URL;

  if(!base) {
    throw new Error("NEXT_PUBLIC_CDN_URL is not defined");
  }

  path = path
    .replace(/^\//g, "")
    .replace(/^cdn/, "")
    .replace(/^\//g, "");

  return new URL(`/cdn/${path}`, base).toString();
}


export function capitalize<T extends string>(value: T): Capitalize<T> {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<T>;
}


export function isBase64(str: unknown): str is string {
  if(!str || typeof str !== "string") return false;

  try {
    // eslint-disable-next-line no-useless-escape
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
    return (str.length % 4 === 0 && base64Regex.test(str)) || btoa(atob(str)) === str;
  } catch {
    return false;
  }
}


export function isNumber(arg: any): boolean {
  if(typeof arg === "number")
    return true;

  if(typeof arg !== "string")
    return false;

  if((/^0x[0-9a-f]+$/i).test(arg))
    return true;

  return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(arg);
}


export function parseBufferEncoding(payload: Buffer, encoding?: unknown): Buffer | string {
  return typeof encoding === "string" && Buffer.isEncoding(encoding) ?
    payload.toString(encoding) :
    payload;
}
