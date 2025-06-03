import { strShuffle } from "@/utils";


export function uuidv7(): string {
  const ts = Date.now();
  const timeHex = ts.toString(16).padStart(12, "0");

  const randomBytesArray = new Uint8Array(13);
  crypto.getRandomValues(randomBytesArray);

  const part3 = `7${(randomBytesArray[0] & 0x0f).toString(16)}${[...randomBytesArray.slice(1, 3)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")}`;

  const part4 = [...randomBytesArray.slice(3, 6)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const part5 = [...randomBytesArray.slice(6)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const uuid = [
    timeHex.substring(0, 8),
    timeHex.substring(8, 12),
    part3,
    part4,
    part5,
  ];

  return uuid.join("-").toLowerCase();
}


export function shortId(length: number = 12, special: boolean = false): string {
  // Make sure the alphabet always has 62 characters
  const ALPHABET = ("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + (special ? "-_" : ""));

  const buffer = new Uint8Array(Math.ceil(length * Math.log2(ALPHABET.length) / 8));
  crypto.getRandomValues(buffer);

  let value = BigInt(`0x${Array.from(buffer).map(b => b.toString(16).padStart(2, "0")).join("")}`);
  let result = "";

  while(value > 0) {
    result = ALPHABET[Number(value % BigInt(ALPHABET.length))] + result;
    value = value / BigInt(ALPHABET.length);
  }

  return result;
}


export function longId(): string {
  const ts = BigInt(Date.now());

  const timeHex = ts.toString(16).padStart(12, "0");
  const randomBuffer = new Uint8Array(13);
  crypto.getRandomValues(randomBuffer);

  const random = Array.from(randomBuffer).map(b => b.toString(16).padStart(2, "0")).join("");

  return `${timeHex}${strShuffle(`${random}${shortId(24, true)}`)}`;
}
