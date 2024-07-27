import { contractAddr } from "@/pluts_contracts/contract";
import { WalletApi as LucidWalletApi, Data } from "lucid-cardano";
import { getLucid } from "../lucid";
import { WalletApi } from "use-cardano-wallet";
import { createProposalDatum, createUnknownBidDatum } from "./datums";
import { hashData } from "@harmoniclabs/plu-ts";

export async function createProposal(
  creatorAddress: string,
  title: string,
  description: string,
  deadline: Date,
  amount: bigint,
  walletApi: Omit<WalletApi, "experimental">
) {
  const lucid = await getLucid();

  lucid.selectWallet(walletApi as unknown as LucidWalletApi);

  const tx = await lucid
    .newTx()
    .payToContract(
      contractAddr,
      {
        inline: Data.to(
          createProposalDatum(title, description, creatorAddress, deadline)
        ),
      },
      {
        lovelace: amount * BigInt(1_000_000),
      }
    )
    .complete()
    .then((txComplete) => txComplete.sign().complete());

  return tx.submit();
}

export async function createUnknownBid(
  amount: number,
  title: string,
  description: string,
  proposalRef: string,
  bidderAddress: string,
  api: WalletApi
) {
  const lucid = await getLucid();

  lucid.selectWallet(api as unknown as LucidWalletApi);

  const { data, bid, hash } = createUnknownBidDatum(
    proposalRef,
    BigInt(amount),
    bidderAddress,
    title,
    description
  );

  localStorage.setItem(hash, Data.to(bid));

  const tx = await lucid
    .newTx()
    .payToContract(
      contractAddr,
      {
        inline: Data.to(data),
      },
      {
        lovelace: BigInt(0),
      }
    )
    .complete()
    .then((txComplete) => txComplete.sign().complete());

  return tx.submit();
}
