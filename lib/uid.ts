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
