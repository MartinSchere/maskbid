import { compile, data, int, passert, pBool, pBSToData, perror, pfn, pisEmpty, plet, pmatch, PScriptContext, pserialiseData, psha2_256, PTxOut, punBData, punIData, punsafeConvertType, Script, ScriptType, unit } from "@harmoniclabs/plu-ts";
import { BID_CTOR_IDX, MockBid, MockProposal, PrivateTenderDatum } from "./PrivateTenderDatum";
import { BidAction } from "./BidAction";
import { plovelaces } from "./plovelaces";

const privateTender = pfn([
    PrivateTenderDatum.type,
    data,
    PScriptContext.type
],  unit)
(( datum, rdmr, { tx, purpose }) => {

    const ownInput = plet(
        pmatch( purpose )
        .onSpending(({ utxoRef: spendRef }) =>
            tx.inputs.filter(({ utxoRef }) => utxoRef.eq( spendRef ) )
            .head
            .resolved
        )
        ._( _ => perror( PTxOut.type ) )
    );

    const ownAddr = plet( ownInput.address );
    const ownValue = plet( ownInput.value );

    return passert.$(
        pmatch( datum )
        .onProposal(({ decisionTime, reqesterAddr }) => {

            // inlined
            const onlyTwoInsFormSelf = (
                pisEmpty.$(
                    tx.inputs.filter( input => 
                        input.resolved.address.credential
                        .eq( ownAddr.credential )
                    ).tail.tail
                )
            )

            // inlined
            const bidInputIdx = punIData.$( rdmr );

            const bidInput = plet( tx.inputs.at( bidInputIdx ).resolved );
            const bidOutput = plet( tx.outputs.head );

            const bid = plet(
                punsafeConvertType(
                    // inline datum or fail
                    bidInput.datum.raw.fields.head,
                    MockBid.type
                )
            );

            // inlined
            const correctBidInputShape = (
                bidInput.address.credential.eq( ownAddr.credential )
                .strictAnd(
                    bid.raw.index.eq( BID_CTOR_IDX )
                )
            );

            // inlined
            const canDecide = decisionTime.ltEq(
                pmatch( tx.interval.from.bound )
                .onPFinite(({ _0 }) => _0)
                ._( _ => perror( int ) )
            );

            // inlined
            const requesterSigned = (
                tx.signatories.some(
                    reqesterAddr.credential.peq
                )
            );

            // inlined
            const bidderReceived = (
                bidOutput.address.eq( bid.bidderAddr )
                .strictAnd(
                    plovelaces.$( bidOutput.value )
                    .gtEq( bid.proposedAmount )
                )
            );

            return onlyTwoInsFormSelf
            .strictAnd( correctBidInputShape )
            .strictAnd( canDecide )
            .strictAnd( requesterSigned )
            .strictAnd( bidderReceived );
        })
        .onUnknownBid(({ bidHash, proposalRef }) => {
            
            const proposalRefIn = plet(
                plet( proposalRef.peq ).in( isProposalRef => 
                    tx.refInputs.filter(({ utxoRef }) => isProposalRef.$( utxoRef ))
                    .head // fails if not fund
                    .resolved
                )
            );

            const revealTime = plet(
                punsafeConvertType(
                    // fails if not inline datum
                    proposalRefIn.datum.raw.fields.head,
                    MockProposal.type
                ).revealTime
            );

            // inlined
            const canReveal = revealTime.ltEq(
                pmatch( tx.interval.from.bound )
                .onPFinite(({ _0 }) => _0)
                ._( _ => perror( int ) )
            );

            const revealedBidOut = plet( tx.outputs.head );

            // inlined
            const staysInContract = (
                revealedBidOut.address.eq( ownAddr )
            );

            // inlined
            const correctDatum = (
                bidHash.eq(
                    psha2_256.$(
                        pserialiseData.$(
                            revealedBidOut
                            // inline datum (or fail calling serialiseData)
                            .datum.raw.fields.head
                        )
                    )
                )
            );

            return canReveal
            .strictAnd( staysInContract )
            .strictAnd( correctDatum );

        })
        .onBid(({ bidderAddr, proposalRef }) =>
            pmatch(
                punsafeConvertType(
                    rdmr,
                    BidAction.type
                )
            )
            // bid is already revealed,
            // we know reveal time has passed
            .onRetireBid( _ => 
                tx.signatories.some(
                    punBData.$(
                        bidderAddr.credential.raw.fields.head
                    ).peq
                )
            )
            // forward validation to Proposal spending
            .onSelectBid( _ => tx.inputs.some( input => input.utxoRef.eq( proposalRef ) ))
        )
    );
});

export const contractBytes = compile( privateTender, [1,0,0] );

export const contractScript = new Script(
    ScriptType.PlutusV2,
    contractBytes
);