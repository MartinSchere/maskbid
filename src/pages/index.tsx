import { Button } from "@/components/ui/button";
import { proposalUtxoToProposal } from "@/lib/builder/datums";
import { maestroClient } from "@/lib/maestro";
import { cn, formatLovelace } from "@/lib/utils";
import { contractAddr } from "@/pluts_contracts/contract";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import useCardanoWallet from "use-cardano-wallet";

interface Proposal {
  title: string;
  description: string;
  amount: number;
  createdAt: Date;
  expiry: Date;
  creator: string;
  id: string;
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

  const { data, error, refetch, isRefetching } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data } = await maestroClient.addresses.utxosByAddress(
        contractAddr,
        {
          resolve_datums: true,
        }
      );

      return data.flatMap((d) => {
        const result = proposalUtxoToProposal(d);

        if (!result) return [];

        if (isNaN(result.expiry.getTime())) return [];

        return result ? [result] : [];
      });
    },
  });

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between w-full mb-8">
        <h1 className="font-bold text-2xl ">Browse RFPs</h1>

        <Button onClick={() => refetch()}>
          <RefreshCcw
            className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")}
          />{" "}
          Refresh
        </Button>
      </div>

      <pre>{error?.message}</pre>

      <ul className="flex gap-2 flex-col">
        {data?.map((item, index) => (
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
