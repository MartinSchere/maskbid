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
import { formatLovelace } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext } from "next";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.number(),
});

export default function RfpRoute({ id }: { id: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Tabs defaultValue="detail">
      <TabsList className="w-full mt-12">
        <TabsTrigger value="detail" className="w-1/3">
          RFP Detail
        </TabsTrigger>
        <TabsTrigger value="make" className="w-1/3">
          Make a bid
        </TabsTrigger>
        {/* todo: make this only for owner */}
        <TabsTrigger value="select" className="w-1/3">
          Select a bid
        </TabsTrigger>
      </TabsList>

      <TabsContent value="detail">
        <div className="mt-10">
          <h1 className="font-bold text-2xl">{data.title}</h1>

          <p className="opacity-50 mt-4">{data.description}</p>

          <h3 className="font-bold mt-4">
            Requesting {formatLovelace(data.amount)} ADA
          </h3>
        </div>
      </TabsContent>

      <TabsContent value="make">
        <h1 className="mt-10 mb-8 text-2xl font-bold">
          Make a bid for this RFP
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your bid's title" {...field} />
                  </FormControl>

                  <FormDescription>
                    This title will be displayed to the requesting entity
                  </FormDescription>
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
            <Button type="submit">Place bid</Button>
          </form>
        </Form>
      </TabsContent>
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

const data = {
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
};
