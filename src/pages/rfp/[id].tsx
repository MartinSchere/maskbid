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
import { proposalUtxoToProposal } from "@/lib/builder/datums";
import { maestroClient } from "@/lib/maestro";
import { formatLovelace } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtxoWithSlot } from "@maestro-org/typescript-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { useForm } from "react-hook-form";
import Countdown from "react-countdown";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import useCardanoWallet from "use-cardano-wallet";
import { createUnknownBid } from "@/lib/builder/builder";
import { useMemo } from "react";

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

  return (
    <Tabs defaultValue="detail">
      <TabsList className="w-full mt-12">
        <TabsTrigger value="detail" className="w-full">
          RFP Detail
        </TabsTrigger>
        <TabsTrigger value="make" className="w-full">
          Make a bid
        </TabsTrigger>
        {/* todo: make this only for owner */}
        {data && data.creator === address && (
          <TabsTrigger value="select" className="w-full">
            Select a bid
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="detail">
        {data && !isLoading && (
          <div className="mt-10">
            <h1 className="font-bold text-2xl">{data.title}</h1>
            <h2 className="opacity-80 text-lg">
              <Countdown date={data.expiry} />
              <span className="ml-2">remaining</span>
            </h2>

            <p className="opacity-50 mt-4">{data.description}</p>

            <h3 className="font-bold mt-4">
              Requesting {formatLovelace(data.amount)} ADA
            </h3>
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
                    This is your proposal&apos;s amount. This and all the other
                    information will be private until the revelation phase.
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
      <TabsContent value="select">Select a bid</TabsContent>
    </Tabs>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      id: context.params?.id,
    },
  };
}
