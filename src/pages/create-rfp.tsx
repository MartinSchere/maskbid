import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
import { useToast } from "@/components/ui/use-toast";
import { createProposal } from "@/lib/builder/builder";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useCardanoWallet from "use-cardano-wallet";
import { z } from "zod";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.coerce.number(),
  deadline: z.date().min(new Date(), "Deadline must be in the future"),
});

export default function CreateRfpPage() {
  const { api, address } = useCardanoWallet();
  const { toast } = useToast();

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!address || !api) {
        form.setError("root", {
          message: "You need to connect your wallet to create an RFP",
        });
        return;
      }

      const { title, description, amount, deadline } = values;

      await createProposal(
        address,
        title,
        description,
        deadline,
        BigInt(amount),
        api
      );
    },
    onError: (error) => {
      console.error(error);
      form.setError("root", {
        message: "An error occurred while creating the RFP",
      });
    },
    onSuccess: () => {
      toast({
        title: "RFP successfully created",
        description:
          "Your RFP has been successfully created and is now accepting bids",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className="w-[800px] mt-24">
      <h1 className="text-2xl mb-8 font-bold">Create your RFP</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => onSubmit(v))}
          className="space-y-8 "
        >
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
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2">Deadline</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>

                <FormDescription>
                  This is the deadline for the RFP. Proposals submitted after
                  this date will be rejected.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <p className="text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <Button type="submit" isLoading={isPending}>
            Create RFP
          </Button>
        </form>
      </Form>
    </div>
  );
}
