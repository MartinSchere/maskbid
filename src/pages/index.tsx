import { maestro } from "@/lib/maestro";
import { Lucid, MaestroSupportedNetworks, UTxO } from "lucid-cardano";
import { useEffect, useState } from "react";
import useCardanoWallet from "use-cardano-wallet";

export default function Home() {
  const { address } = useCardanoWallet();
  const [utxos, setUtxos] = useState<undefined | UTxO[]>();

  useEffect(() => {
    async function run() {
      if (!address) return;
      const lucid = await Lucid.new(
        maestro,
        (process.env.NEXT_PUBLIC_NETWORK as MaestroSupportedNetworks) ??
          "Mainnet"
      );
      const utxos = await lucid.utxosAt(address);

      setUtxos(utxos);
    }
    run();
  }, [address]);

  return (
    <div>
      <h1>Home</h1>

      <pre>{utxos && JSON.stringify(utxos, null, 2)}</pre>
    </div>
  );
}
