import { Maestro, MaestroSupportedNetworks } from "lucid-cardano";

export const maestro = new Maestro({
  network:
    (process.env.NEXT_PUBLIC_NETWORK as MaestroSupportedNetworks) ?? "Mainnet",
  apiKey: process.env.NEXT_PUBLIC_MAESTRO_API_KEY || "",
});
