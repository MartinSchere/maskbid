import {
  Maestro as LucidMaestro,
  MaestroSupportedNetworks,
} from "lucid-cardano";
import { MaestroClient, Configuration } from "@maestro-org/typescript-sdk";

export const maestroProvider = new LucidMaestro({
  network:
    (process.env.NEXT_PUBLIC_NETWORK as MaestroSupportedNetworks) ?? "Mainnet",
  apiKey: process.env.NEXT_PUBLIC_MAESTRO_API_KEY || "",
});

export const maestroClient = new MaestroClient(
  new Configuration({
    apiKey: process.env.NEXT_PUBLIC_MAESTRO_API_KEY,
    network: process.env.NEXT_PUBLIC_NETWORK as MaestroSupportedNetworks,
  })
);
