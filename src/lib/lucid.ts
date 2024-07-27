import { Lucid, MaestroSupportedNetworks } from "lucid-cardano";
import { maestro } from "./maestro";

export const getLucid = async () =>
  Lucid.new(
    maestro,
    (process.env.NEXT_PUBLIC_NETWORK as MaestroSupportedNetworks) ?? "Mainnet"
  );
