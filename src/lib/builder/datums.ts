import {
  Address,
  canBeData,
  DataB,
  DataConstr,
  dataFromCbor,
  DataI,
  dataToCbor,
  dataToCborObj,
  forceData,
  Hash28,
  isData,
  PaymentCredentials,
  Data as PlutsData,
  StakeCredentials,
  StakeKeyHash,
} from "@harmoniclabs/plu-ts";
import { sha2_256 } from "@harmoniclabs/crypto";
import {
  Constr,
  Data,
  Wallet,
  WalletApi as LucidWalletApi,
  fromHex,
  toHex,
} from "lucid-cardano";
import { getLucid } from "../lucid";
import { contractAddr } from "@/pluts_contracts/contract";
import { WalletApi } from "use-cardano-wallet";
import { decodeHex, slotToDate } from "../utils";
import { UtxoWithSlot } from "@maestro-org/typescript-sdk";

function createBid(
  proposalUtxoRef: string,
  bidAmount: bigint,
  bidderAddress: string,
  title: string,
  description: string
) {
  const salt = Math.floor(Math.random() * 1000000)
    .toString(16)
    .padStart(6, "0");

  return new Constr(2, [
    utxoRefToData(proposalUtxoRef),
    bidAmount,
    addressToPlutsData(bidderAddress),
    salt,
  ]);
}

export function createUnknownBidDatum(
  proposalUtxoRef: string,
  bidAmount: bigint,
  bidderAddress: string,
  title: string,
  description: string
) {
  const bid = createBid(
    proposalUtxoRef,
    bidAmount,
    bidderAddress,
    title,
    description
  );
  const hash = hashDatum(bid);

  return {
    data: new Constr(1, [utxoRefToData(proposalUtxoRef), hash]),
    bid,
    hash,
  };
}

export function hashDatum(datum: Data) {
  console.log("DATUM", datum);
  const cbor = Data.to(datum);
  console.log("CBOR", cbor);
  return toHex(sha2_256(fromHex(cbor)));
}

function utxoRefToData(utxoRef: string) {
  const [txHash, txIndex] = utxoRef.split(".");
  return new Constr(0, [new Constr(0, [txHash]), BigInt(txIndex)]);
}

function addressToPlutsData(address: string) {
  return Data.from(dataToCbor(Address.fromString(address).toData()).toString());
}

export function createProposalDatum(
  title: string,
  description: string,
  ownerAddress: string,
  deadline: Date
) {
  return new Constr(0, [
    BigInt(deadline.valueOf()),
    BigInt(deadline.valueOf() + 1000 * 60),
    addressToPlutsData(ownerAddress),
    Buffer.from(title).toString("hex"),
    Buffer.from(description).toString("hex"),
  ]);
}

export function decodeProposalDatum(datum: any) {
  if (!canBeData(datum)) return undefined;

  const data = forceData(datum);

  if (!(data instanceof DataConstr)) {
    return undefined;
  }

  const fields = data.fields;

  const revealTime = new Date(Number((fields[0] as DataI).int));
  const decisionTime = new Date(Number((fields[1] as DataI).int));
  const requesterAddr = addressFromPlutsData(fields[2]);

  if (typeof requesterAddr !== "string") return undefined;

  const title = decodeHex((fields[3] as DataB).bytes.toString());
  const description = decodeHex((fields[4] as DataB).bytes.toString());

  return {
    revealTime,
    decisionTime,
    requesterAddr,
    title,
    description,
  };
}

export function decodeBidDatum(datum: any) {
  if (!canBeData(datum)) return undefined;

  const data = forceData(datum);

  if (!(data instanceof DataConstr)) {
    return undefined;
  }

  const fields = data.fields;

  const proposalRef = utxoRefFromData( fields[0] );
  const proposedAmount = Number((fields[1] as DataI).int);
  const bidderAddr = addressFromPlutsData(fields[2]);
  if (typeof bidderAddr !== "string") return undefined;
  
  const salt = (fields[3] as DataB).toString();

  const title = decodeHex((fields[4] as DataB).bytes.toString());
  const description = decodeHex((fields[5] as DataB).bytes.toString());

  return {
    proposalRef,
    proposedAmount,
    bidderAddr,
    salt,
    title,
    description,
  };
}

export function utxoRefFromData( data: PlutsData )
{
  if(!( data instanceof DataConstr )) return undefined;
  
  const [ idConstr, idx ] = data.fields;
  if(!(idConstr instanceof DataConstr)) return undefined;

  const [ wrappedId ] = idConstr.fields;
  if(!( wrappedId instanceof DataConstr )) return undefined;

  const [ idData ] = wrappedId.fields;
  if(!(idData instanceof DataB)) return undefined;
  if(!(idx instanceof DataI)) return undefined;

  return {
    id: idData.bytes.toString(),
    idx: Number( idx.int )
  };
}

export function addressFromPlutsData(data: PlutsData) {
  if (!(data instanceof DataConstr)) return undefined;
  const [pay, stake] = data.fields;
  if (!(pay instanceof DataConstr && stake instanceof DataConstr))
    return undefined;
  const [payHash] = pay.fields;
  if (!(payHash instanceof DataB)) return undefined;

  const payCreds = new PaymentCredentials(
    Number(pay.constr) === 0 ? "pubKey" : "script",
    new Hash28(payHash.bytes.toBuffer())
  );

  let stakeCreds: StakeCredentials | undefined = undefined;
  const [stakeConstr] = stake.fields;
  if (stakeConstr instanceof DataConstr) {
    const [stakeCredsData] = stakeConstr.fields;
    if (stakeCredsData instanceof DataConstr) {
      const [stakeHash] = stakeCredsData.fields;
      if (stakeHash instanceof DataB) {
        stakeCreds = new StakeCredentials(
          Number(stakeCredsData.constr) === 0 ? "stakeKey" : "script",
          new Hash28(stakeHash.bytes.toBuffer())
        );
      }
    }
  }

  const addr = Address.testnet(payCreds, stakeCreds);

  return addr.toString();
}

export type Proposal = {
  title: string;
  description: string;
  deadline: Date;
  amount: number;
  id: string;
  createdAt: Date;
  expiry: Date;
  creator: `addr1${string}` | `addr_test1${string}`;
};

export function proposalUtxoToProposal(
  utxo: UtxoWithSlot
): Proposal | undefined {
  if (!utxo.datum) {
    return undefined;
  }

  const decoded = decodeProposalDatum(utxo.datum.bytes);

  if (!decoded) {
    return undefined;
  }

  const { title, description, decisionTime, requesterAddr, revealTime } =
    decoded;

  const ada = utxo.assets.find((a) => a.unit === "lovelace")!;

  return {
    title,
    description,
    deadline: revealTime,
    amount: parseInt(ada.amount, 10),
    id: `${utxo.tx_hash}.${utxo.index.toString()}`,
    createdAt: slotToDate(utxo.slot),
    expiry: revealTime,
    creator: requesterAddr,
  };
}
