import {
  contractAddr,
  contractBytes,
  contractScript,
} from "@/pluts_contracts/contract";
import {
  WalletApi as LucidWalletApi,
  Data,
  toHex,
  UTxO,
  applyDoubleCborEncoding,
  unixTimeToEnclosingSlot,
  SLOT_CONFIG_NETWORK,
  C,
  fromHex,
} from "lucid-cardano";
import { getLucid } from "../lucid";
import { WalletApi } from "use-cardano-wallet";
import {
  createProposalDatum,
  createUnknownBidDatum,
  hashDatum,
  hiddenBidUtxoToHiddenBid,
} from "./datums";
import {
  Address,
  DataI,
  defaultProtocolParameters,
  forceData,
  hoistedToStr,
  UTxO as PlutsUTxO,
  TxBuilder,
  TxWitnessSet,
  unit,
  Value,
  VKeyWitness,
} from "@harmoniclabs/plu-ts";
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
  proposalRef: string,
  api: WalletApi
) {
  const lucid = await getLucid();

  const [txHash, txIndex] = proposalRef.split(".");

  const resolvedProposalRef = await lucid.provider.getUtxosByOutRef([
    {
      outputIndex: Number(txIndex),
      txHash,
    },
  ]);

  lucid.selectWallet(api as unknown as LucidWalletApi);

  const bidData = localStorage.getItem(bidHash);

  // 0b050b54e913bdad76fd54552ffe5e65c18ec75268fc1b62af8d66a5dad4e88e
  // const result = hashDatum(Data.from(bidData))
  // console.log("Produced: ", result)

  // throw new Error("" + bidHash);

  if (typeof bidData !== "string")
    throw new Error("unknown bid for hash: " + bidHash);

  const txBuilder = new TxBuilder(defaultProtocolParameters, {
    slotLengthInMilliseconds: SLOT_CONFIG_NETWORK.Preview.slotLength,
    systemStartPOSIX:
      SLOT_CONFIG_NETWORK.Preview.zeroTime +
      SLOT_CONFIG_NETWORK.Preview.zeroSlot * 1000,
  });

  const utxos = (await lucid.wallet.getUtxos())
    .filter((u) => u.address !== contractAddr)
    .toSorted((a, b) => Number(b.assets.lovelace - a.assets.lovelace));

  const hiddenBid = hiddenBidUtxoToHiddenBid(hiddenBidUtxo);
  hiddenBid?.hash;

  const tx = txBuilder.buildSync({
    inputs: [
      {
        utxo: luxidToPlutsUtxo(utxoWithSlotToUtxo(hiddenBidUtxo)),
        inputScript: {
          datum: "inline",
          redeemer: new DataI(0),
          script: contractScript,
        },
      },
      {
        utxo: luxidToPlutsUtxo(utxos[0]),
      },
    ],
    changeAddress: Address.fromString(await lucid.wallet.address()),
    collaterals: [
      luxidToPlutsUtxo(
        (await lucid.wallet.getUtxos()).filter((u) => {
          return Object.keys(u.assets).length === 1;
          //   const units = Object.keys(u.assets);
          //   if (units.length !== 1) return false;
          //   if (units[0] !== "lovelace") return false;
          //   if (u.assets.lovelace >= BigInt(2_000_000)) return false;
        })[0]
      ),
    ],
    readonlyRefInputs: [luxidToPlutsUtxo(resolvedProposalRef[0])],
    invalidBefore:
      unixTimeToEnclosingSlot(Date.now(), SLOT_CONFIG_NETWORK.Preview) - 100,
    outputs: [
      {
        address: Address.fromString(contractAddr),
        value: Value.lovelaces(10_000_000),
        datum: forceData(bidData),
      },
    ],
  });

  console.log(JSON.stringify(tx.toJson(), undefined, 2));

  const txStr = tx.toCbor().toString();

  const witnesses = TxWitnessSet.fromCbor(await api.signTx(txStr, true));

  for (const vk of witnesses.vkeyWitnesses ?? []) {
    tx.addVKeyWitness(vk);
  }

  await lucid.provider.submitTx(tx.toCbor().toString());
}

export function luxidToPlutsUtxo(hiddenBidUtxo: UTxO): PlutsUTxO {
  return new PlutsUTxO({
    utxoRef: {
      id: hiddenBidUtxo.txHash,
      index: hiddenBidUtxo.outputIndex,
    },
    resolved: {
      address: Address.fromString(hiddenBidUtxo.address),
      value: Value.fromUnits(
        Object.entries(hiddenBidUtxo.assets).map(([unit, amount]) => ({
          unit,
          quantity: BigInt(amount),
        }))
      ),
      datum: hiddenBidUtxo.datum ? forceData(hiddenBidUtxo.datum!) : undefined,
    },
  });
}
