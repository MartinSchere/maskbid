import { contractAddr, contractBytes } from "@/pluts_contracts/contract";
import { WalletApi as LucidWalletApi, Data, toHex, UTxO } from "lucid-cardano";
import { getLucid } from "../lucid";
import { WalletApi } from "use-cardano-wallet";
import { createProposalDatum, createUnknownBidDatum } from "./datums";
import { hashData } from "@harmoniclabs/plu-ts";
import { UtxoWithSlot } from "@maestro-org/typescript-sdk";
import { utxoWithSlotToUtxo } from "../utils";

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

export async function createRevealedBid(
  bidHash: string,
  hiddenBidUtxo: UtxoWithSlot,
  api: WalletApi
) {
  const lucid = await getLucid();

  lucid.selectWallet(api as unknown as LucidWalletApi);

  const bidData = localStorage.getItem(bidHash);

  if (typeof bidData !== "string")
    throw new Error("unknown bid for hash: " + bidHash);

  const tx = await lucid
    .newTx()
    .attachSpendingValidator({
      type: "PlutusV2",
      script: toHex(contractBytes),
    })
    .collectFrom(
      [utxoWithSlotToUtxo(hiddenBidUtxo)],
      Data.void() // unused redeemer
    )
    .payToContract(
      contractAddr,
      {
        inline: Data.to(bidData),
      },
      {
        lovelace: BigInt(0),
      }
    )
    .complete()
    .then((txComplete) => txComplete.sign().complete());

  return tx.submit();
}
