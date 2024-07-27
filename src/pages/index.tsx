import { decodeProposalDatum } from "@/lib/builder/datums";
import { getLucid } from "@/lib/lucid";
import { maestroClient, maestroProvider } from "@/lib/maestro";
import { formatLovelace } from "@/lib/utils";
import { contractAddr } from "@/pluts_contracts/contract";
import { useQuery } from "@tanstack/react-query";
import { Lucid, MaestroSupportedNetworks, UTxO } from "lucid-cardano";
import Link from "next/link";
import { useEffect, useState } from "react";
import useCardanoWallet from "use-cardano-wallet";

interface Proposal {
  title: string;
  description: string;
  amount: number;
  createdAt: Date;
  expiry: Date;
  creator: string;
  id: number;
}

function ProposalCard({
  id,
  title,
  description,
  amount,
  createdAt,
  expiry,
  creator,
}: Proposal) {
  return (
    <Link href={`/rfp/${id}`}>
      <div className="px-4 py-8 border rounded border-border space-y-2 hover:translate-x-2 transition-transform">
        <h1 className="text-xl font-medium">{title}</h1>
        <p className="text-sm text-primary opacity-40">{description}</p>

        <h3 className="font-bold opacity-80">
          Requesting {formatLovelace(amount)} ADA
        </h3>
      </div>
    </Link>
  );
}

export default function Home() {
  const { address } = useCardanoWallet();

  const { data, error } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data } = await maestroClient.addresses.utxosByAddress(
        contractAddr,
        {
          resolve_datums: true,
        }
      );

      return data.flatMap((d) => {
        if (!d.datum) {
          return [];
        }

        return [decodeProposalDatum(d.datum.bytes)];
      });
    },
  });

  return (
    <div>
      <h1 className="font-bold text-2xl mb-8">Search RFPs</h1>

      <pre>{JSON.stringify(data ?? {}, null, 2)}</pre>
      <pre>{error?.message}</pre>

      <ul className="flex gap-2 flex-col">
        {list.map((item, index) => (
          <ProposalCard key={index} {...item} />
        ))}
      </ul>
    </div>
  );
}

const list = [
  {
    id: 1,
    title:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad, aperiam?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id, recusandae aliquam voluptatem itaque expedita veniam debitis perferendis. Perspiciatis veniam repellat hic, assumenda iure magni perferendis velit unde error labore eveniet accusamus, corporis adipisci iusto illum maxime ut laboriosam. Dicta nulla assumenda esse corporis reprehenderit quae neque quam quibusdam exercitationem inventore.",
    amount: 100_000_000,
    expiry: new Date(),
    createdAt: new Date(),
    creator:
      "addr_test1qrzgs8m09t5nr9p7nd67wnhrrppqx002hq97kke39k49xk7d5yf8k8wv0tgm7taz5wu2wgp9ty3qyevp2gu7hgnvr67qrg5u45",
  },
  {
    id: 2,
    title:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad, aperiam?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id, recusandae aliquam voluptatem itaque expedita veniam debitis perferendis. Perspiciatis veniam repellat hic, assumenda iure magni perferendis velit unde error labore eveniet accusamus, corporis adipisci iusto illum maxime ut laboriosam. Dicta nulla assumenda esse corporis reprehenderit quae neque quam quibusdam exercitationem inventore.",
    amount: 300_000_000,
    expiry: new Date(),
    createdAt: new Date(),
    creator:
      "addr_test1qrzgs8m09t5nr9p7nd67wnhrrppqx002hq97kke39k49xk7d5yf8k8wv0tgm7taz5wu2wgp9ty3qyevp2gu7hgnvr67qrg5u45",
  },
  {
    id: 3,
    title:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad, aperiam?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id, recusandae aliquam voluptatem itaque expedita veniam debitis perferendis. Perspiciatis veniam repellat hic, assumenda iure magni perferendis velit unde error labore eveniet accusamus, corporis adipisci iusto illum maxime ut laboriosam. Dicta nulla assumenda esse corporis reprehenderit quae neque quam quibusdam exercitationem inventore.",
    amount: 90_000_000,
    expiry: new Date(),
    createdAt: new Date(),
    creator:
      "addr_test1qrzgs8m09t5nr9p7nd67wnhrrppqx002hq97kke39k49xk7d5yf8k8wv0tgm7taz5wu2wgp9ty3qyevp2gu7hgnvr67qrg5u45",
  },
];
