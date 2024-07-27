import { contractAddr, contractBytes, contractScript } from "@/pluts_contracts/contract";
import { WalletApi as LucidWalletApi, Data, toHex, UTxO, applyDoubleCborEncoding, unixTimeToEnclosingSlot, SLOT_CONFIG_NETWORK } from "lucid-cardano";
import { getLucid } from "../lucid";
import { WalletApi } from "use-cardano-wallet";
import { createProposalDatum, createUnknownBidDatum } from "./datums";
import { Address, DataI, defaultProtocolParameters, forceData, hoistedToStr, UTxO as PlutsUTxO, TxBuilder, unit, Value } from "@harmoniclabs/plu-ts";
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

  if (typeof bidData !== "string")
    throw new Error("unknown bid for hash: " + bidHash);


  const txBuilder = new TxBuilder( defaultProtocolParameters );

  let _tx = txBuilder.buildSync({
    inputs: [
      {
        utxo: luxidToPlutsUtxo( hiddenBidUtxo ),
        inputScript: {
          datum: "inline",
          redeemer: new DataI( 0 ),
          script: contractScript
        }
      }
    ],
    collaterals: [
      luxidToPlutsUtxo(
        (await lucid.wallet.getUtxos())
        .filter(
          u => {
            const units = Object.keys( u.assets );
            if( units.length !== 1 ) return false;
            if( units[0] !== "lovelace" ) return false;
            if( (u.assets as any).lovelace >= 2_000_000 ) return false;
  
            return true
          }
        )[0]
      )
    ],
    readonlyRefInputs: [
      luxidToPlutsUtxo( resolvedProposalRef )
    ],
    invalidBefore: unixTimeToEnclosingSlot(Date.now(), SLOT_CONFIG_NETWORK.Preprod ),
    outputs: [
      {
        address: Address.fromString( contractAddr ),
        value: Value.lovelaces( 2_000_000 ),
        datum: forceData( bidData ) 
      }
    ]
  })


  const tx = await lucid
    .newTx()
    .attachSpendingValidator({
      type: "PlutusV2",
      script: applyDoubleCborEncoding(toHex(contractBytes)),
    })
    .readFrom(resolvedProposalRef)
    .validFrom(+new Date())
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

export function luxidToPlutsUtxo( hiddenBidUtxo: any ): PlutsUTxO
{
  return new PlutsUTxO({
    utxoRef: {
      id: hiddenBidUtxo.tx_hash,
      index: hiddenBidUtxo.index
    },
    resolved: {
      address: Address.fromString( hiddenBidUtxo.address ),
      value: Value.fromUnits( hiddenBidUtxo.assets as any ),
      datum: forceData( hiddenBidUtxo.datum?.bytes! )
    }
  })
}