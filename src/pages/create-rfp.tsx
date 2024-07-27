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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  expiry: z.date(),
});

export default function CreateRfpPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="w-[800px] mt-28">
      <h1 className="text-2xl mb-8 font-bold">Create your RFP</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your RFP's title" {...field} />
                </FormControl>

                <FormDescription>
                  This title will be displayed to the community.
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
                    placeholder="Enter the maximum amount (ADA)"
                    {...field}
                  />
                </FormControl>

                <FormDescription>
                  This is the maximum amount you are willing to pay for the
                  project. This will be pledged into the smart contract.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create RFP</Button>
        </form>
      </Form>
    </div>
  );
}
