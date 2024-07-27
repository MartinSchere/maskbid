import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLovelace(value: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  return formatter.format(`${value / 1000000}`).replace("$", "");
}

export function decodeHex(hexString: string) {
  return Buffer.from(hexString, "hex").toString("utf-8");
}
export function slotToDate(slotNo: number) {
  return new Date((1596491091 + (slotNo - 4924800)) * 1000);
}
