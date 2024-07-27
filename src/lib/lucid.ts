import { Lucid, MaestroSupportedNetworks } from "lucid-cardano";
import { maestroProvider } from "./maestro";

export const getLucid = async () =>
  Lucid.new(
    maestroProvider,
    (process.env.NEXT_PUBLIC_NETWORK as MaestroSupportedNetworks) ?? "Mainnet"
  );
