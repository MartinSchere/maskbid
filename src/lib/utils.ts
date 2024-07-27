import { UtxoWithSlot } from "@maestro-org/typescript-sdk";
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

export function truncateStringMiddle(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;

  const start = str.slice(0, maxLength / 2);
  const end = str.slice(-maxLength / 2);

  return `${start}...${end}`;
}

export function utxoWithSlotToUtxo(utxo: UtxoWithSlot) {
  return {
    address: utxo.address,
    assets: utxo.assets.reduce(
      (acc, { unit, amount }) => ({
        ...acc,
        [unit]: BigInt(amount),
      }),
      {}
    ),
    outputIndex: utxo.index,
    txHash: utxo.tx_hash,
    datum: utxo.datum?.bytes,
  };
}
