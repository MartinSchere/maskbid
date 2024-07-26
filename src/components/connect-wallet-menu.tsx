"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCardanoWallet from "use-cardano-wallet";
import { Button } from "./ui/button";
import { formatLovelace } from "@/lib/utils";
import { LogOut } from "lucide-react";

export const ConnectWalletMenu = () => {
  const {
    detectedWallets,
    isConnected,
    isConnecting,
    address,
    lovelaceBalance,
    disconnect,
    connectedWallet,
    connect,
  } = useCardanoWallet();

  if (isConnected && connectedWallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex gap-2">
            <img
              src={connectedWallet.icon}
              alt="wallet-icon"
              className="w-6 h-6"
            />
            {formatLovelace(lovelaceBalance!)} ADA
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="flex items-center gap-2">
            <img
              src={connectedWallet.icon}
              alt="wallet-icon"
              className="w-6 h-6"
            />
            {connectedWallet.displayName} Wallet
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={disconnect}
          >
            <LogOut className="w-4 h-4 text-muted-foreground mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button isLoading={isConnecting}>Connect Wallet</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select your wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {detectedWallets.map((wallet) => (
          <DropdownMenuItem
            key={wallet.name}
            className="cursor-pointer flex gap-2 items-center"
            onClick={() => connect(wallet.name)}
          >
            <img src={wallet.icon} alt="wallet-icon" className="w-6 h-6" />{" "}
            {wallet.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
