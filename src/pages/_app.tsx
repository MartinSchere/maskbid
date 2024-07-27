import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Header } from "@/components/header";
import { Space_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <main className={cn(spaceMono.className, "mx-64")}>
        <Header /> <Component {...pageProps} />
        <style jsx global>{`
      body {
        font-family: ${spaceMono.style.fontFamily};
      `}</style>
      </main>
      <Toaster />
    </QueryClientProvider>
  );
}
