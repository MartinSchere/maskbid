import { Address, dataToCbor } from "@harmoniclabs/plu-ts";
import {
  Constr,
  Data,
  Wallet,
  WalletApi as LucidWalletApi,
} from "lucid-cardano";
import { getLucid } from "../lucid";
import { contractAddr } from "@/pluts_contracts/contract";
import { WalletApi } from "use-cardano-wallet";

function createProposalDatum(
  title: string,
  description: string,
  ownerAddress: string,
  deadline: Date
) {
  return new Constr(0, [
    BigInt(deadline.valueOf()),
    BigInt(deadline.valueOf() + 1000 * 60),
    Data.from(dataToCbor(Address.fromString(ownerAddress).toData()).toString()),
    Buffer.from(title).toString("hex"),
    Buffer.from(description).toString("hex"),
  ]);
}

export function decodeProposalDatum(datum: any) {
  // {
  //     "constructor": 0,
  //     "fields": [
  //       {
  //         "int": 1722290400000
  //       },
  //       {
  //         "int": 1722290460000
  //       },
  //       {
  //         "constructor": 0,
  //         "fields": [
  //           {
  //             "constructor": 0,
  //             "fields": [
  //               {
  //                 "bytes": "b759a7b9ff05d5f9ed4e5154136c382ac83609b0c85732c86eb46d47"
  //               }
  //             ]
  //           },
  //           {
  //             "constructor": 0,
  //             "fields": [
  //               {
  //                 "constructor": 0,
  //                 "fields": [
  //                   {
  //                     "constructor": 0,
  //                     "fields": [
  //                       {
  //                         "bytes": "97b3ea1ed8e2a714b7f4fbd4f997f0f7d3f42126398694d6d080c1ae"
  //                       }
  //                     ]
  //                   }
  //                 ]
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         "bytes": "46697273742070726f706f73616c"
  //       },
  //       {
  //         "bytes": "48656c6c6f"
  //       }
  //     ]
  //   }

  const { fields } = datum;

  const revealTime = new Date(fields[0].int);
  const decisionTime = new Date(fields[1].int);
  console.log(Data.to(Data.fromJson(fields[2])));
  const requesterAddr = Address.fromCbor(Data.to(Data.fromJson(fields[2])));

  const title = Buffer.from(fields[3].bytes, "hex").toString();
  const description = Buffer.from(fields[4].bytes, "hex").toString();

  return {
    revealTime,
    decisionTime,
    requesterAddr,
    title,
    description,
  };
}

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
