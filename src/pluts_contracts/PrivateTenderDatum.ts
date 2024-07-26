import { bs, int, PAddress, pInt, pstruct, PTxOutRef } from "@harmoniclabs/plu-ts";

export const PrivateTenderDatum = pstruct({
    Proposal: {
        // lower time when unkown bid can be revealed
        revealTime: int,
        // lower time when decision can be taken
        decisionTime: int,
        // address of who is requesting the project
        reqesterAddr: PAddress.type
    },
    UnknownBid: {
        proposalRef: PTxOutRef.type,
        bidHash: bs
    },
    Bid: {
        proposalRef: PTxOutRef.type,
        proposedAmount: int,
        bidderAddr: PAddress.type,
        salt: bs // anti brute force
    }
});


// mock proposal datum, just to have some easy access to the fields later
export const MockProposal = pstruct({
    Proposal: {
        // lower time when unkown bid can be revealed
        revealTime: int,
        // lower time when decision can be taken
        decisionTime: int,
        // address of who is requesting the project
        reqesterAddr: PAddress.type
    }
});

export const MockBid = pstruct({
    Bid: {
        proposalRef: PTxOutRef.type,
        proposedAmount: int,
        bidderAddr: PAddress.type,
        salt: bs // anti brute force
    }
});

export const BID_CTOR_IDX = pInt( 2 );