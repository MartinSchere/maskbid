import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bid,
  bidUtxoToBid,
  HiddenBid,
  hiddenBidUtxoToHiddenBid,
  proposalUtxoToProposal,
} from "@/lib/builder/datums";
import { maestroClient } from "@/lib/maestro";
import { formatLovelace, truncateStringMiddle } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtxoWithSlot } from "@maestro-org/typescript-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { useForm } from "react-hook-form";
import Countdown from "react-countdown";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import useCardanoWallet from "use-cardano-wallet";
import { createRevealedBid, createUnknownBid } from "@/lib/builder/builder";
import { useMemo } from "react";
import { contractAddr } from "@/pluts_contracts/contract";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

const columnsRevealedBids: ColumnDef<Bid>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorFn: (bid) => truncateStringMiddle(bid.bidderAddr, 24),
    header: "Creator",
  },
  {
    accessorKey: "proposedAmount",
    header: "Amount",
  },
];

export default function RfpRoute({ id }: { id: string }) {
  const { toast } = useToast();
  const { address, api } = useCardanoWallet();

  const { data, isLoading, error } = useQuery({
    queryKey: ["rfp", id],
    queryFn: async () => {
      const [txHash, txIndex] = id.split(".");

      const [{ data: resolvedRef }, { data: txDetails }] = await Promise.all([
        maestroClient.transactions.txoByTxoRef(txHash, Number(txIndex)),
        maestroClient.transactions.txInfo(txHash),
      ]);

      const utxoWithSlot: UtxoWithSlot = {
        ...resolvedRef,
        slot: txDetails.block_absolute_slot,
      };

      return proposalUtxoToProposal(utxoWithSlot);
    },
  });

  const {
    data: bids,
    isLoading: bidsLoading,
    error: bidsError,
  } = useQuery({
    queryKey: ["bids", id],
    queryFn: async () => {
      const { data } = await maestroClient.addresses.utxosByAddress(
        contractAddr
      );

      const revealedBids = data
        .flatMap((utxo) => {
          const bid = bidUtxoToBid(utxo);
          console.log("Trying to decode: ", bid);
          if (!bid) {
            return [];
          }
          return {
            bid,
            utxo,
          };
        })
        .filter((bid) => bid.bid.proposalRef === id);

      const unrevealedBids = data
        .flatMap((utxo) => {
          const hiddenBid = hiddenBidUtxoToHiddenBid(utxo);
          if (!hiddenBid) {
            return [];
          }
          return [
            {
              hiddenBid,
              utxo,
            },
          ];
        })
        .filter((bid) => bid.hiddenBid.proposalRef === id);

      return {
        revealedBids,
        unrevealedBids,
      };
    },
  });

  const formSchema = useMemo(
    () =>
      z.object({
        title: z.string(),
        description: z.string(),
        amount: z.coerce
          .number()
          .max(
            (data?.amount ?? Infinity) / 1000000,
            "Bid amount must be less than the maximum requested"
          ),
      }),
    [data?.amount]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { title, description, amount } = values;

      if (!address || !api) {
        form.setError("root", {
          message: "You need to connect your wallet to create a bid",
        });
        return;
      }

      await createUnknownBid(amount, title, description, id, address, api);
    },
    onSuccess: () => {
      toast({
        title: "Bid successfully created",
        description: "Your bid has been successfully created",
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { mutate: revealBid, isPending: revealBidIsPending } = useMutation({
    mutationFn: async () => {
      if (!myBids || myBids.length === 0) {
        throw new Error("No bids to reveal");
      }
      if (!api) {
        throw new Error("No wallet connected");
      }

      await createRevealedBid(
        myBids[0].hiddenBid.hash,
        myBids[0].utxo,
        id,
        api
      );
    },
    onSuccess: () => {
      toast({
        title: "Bid successfully revealed",
        description: "Your bid has been successfully revealed",
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const myBids = bids?.unrevealedBids.filter(
    (b) => localStorage.getItem(b.hiddenBid.hash) !== null
  );

  console.log(bids?.revealedBids);

  return (
    <div>
      <h1 className="font-bold text-3xl mt-12">{data?.title}</h1>
      <Tabs defaultValue="detail">
        <TabsList className="w-full mt-8">
          <TabsTrigger value="detail" className="w-full">
            RFP Detail
          </TabsTrigger>
          <TabsTrigger value="make" className="w-full">
            Make a bid
          </TabsTrigger>
          <TabsTrigger value="select" className="w-full">
            Bid list
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detail">
          {data && !isLoading && (
            <div className="mt-10">
              <p className="opacity-50 mt-4">{data.description}</p>
              <hr className="mt-6" />

              <div className="grid grid-cols-2 w-1/2 mt-6 gap-y-4">
                <span className="opacity-60">Time remaining</span>

                <h3 className="opacity-80">
                  <Countdown date={data.expiry} />
                </h3>

                <span className="opacity-60">Creator</span>
                <h3 className="opacity-80">
                  {truncateStringMiddle(data.creator, 24)}
                </h3>

                <span className="opacity-100">Requested amount</span>
                <h3 className="opacity-100">
                  {formatLovelace(data.amount)} ADA
                </h3>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mt-10">
              <h1 className="font-bold text-2xl">Loading...</h1>
            </div>
          )}

          {error && (
            <div className="mt-10">
              <h1 className="font-bold text-2xl">Error</h1>
              <pre>{error.message}</pre>
            </div>
          )}
        </TabsContent>

        <TabsContent value="make">
          <h1 className="mt-10 mb-8 text-2xl font-bold">
            Make a bid for this RFP
          </h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutate(v))}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your bid's title" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter the desired amount (ADA)"
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      This is your proposal&apos;s amount. This and all the
                      other information will be private until the revelation
                      phase.
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" isLoading={isPending}>
                Place bid
              </Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="select">
          {/* Deadline is past, there are no revealed bids already, there are bids to reveal */}
          {data &&
            data.deadline < new Date() &&
            bids?.revealedBids.length === 0 &&
            (myBids?.length ?? 0) > 0 && (
              <div className="w-full flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <h1 className="text-3xl mt-10">Your bid is hidden</h1>
                  <p className="opacity-60 mt-2">
                    You can now reveal your bid by pressing the button below
                  </p>
                  <Button
                    onClick={() => revealBid()}
                    isLoading={revealBidIsPending}
                    className="mt-8"
                  >
                    Reveal bids
                  </Button>
                </div>
              </div>
            )}
          {/* We are before the deadline */}
          {data && +data.deadline > +new Date() && (
            <div className="w-full flex items-center justify-center h-[600px]">
              <div className="text-center">
                <h1 className="text-3xl mt-10">Bids are hidden</h1>
                <p className="opacity-60 mt-2">
                  The bids will remain hidden until the deadline is reached
                </p>
              </div>
            </div>
          )}
          {/* Deadline is passed, but there are no bids revealed  */}
          {data &&
            +data.deadline < +new Date() &&
            myBids?.length === 0 &&
            bids?.revealedBids.length === 0 && (
              <div className="w-full flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <h1 className="text-3xl mt-10">No bids revealed</h1>
                  <p className="opacity-60 mt-2">
                    There are no bids revealed for this RFP
                  </p>
                </div>
              </div>
            )}
          {data &&
            bids &&
            +data.deadline < +new Date() &&
            bids.revealedBids.length > 0 && (
              <DataTable
                columns={columnsRevealedBids}
                data={bids.revealedBids.map((b) => b.bid)}
              />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      id: context.params?.id,
    },
  };
}
