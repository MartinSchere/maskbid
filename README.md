# MaskBid - 2024 NMKR's Berlin Hackathon

This project was the winner of the Transparency category of 2024 NMKR's Berlin Hackathon. It consists of a commit-reveal system to make tender offers.

## Main flow

1. Company posts an RFP on-chain, pledging an amount to a smart contract
2. Contractors commit their hidden bids on-chain to the RFP
3. After the deadline is passed, contractors reveal their bids to the public
4. The Company selects a bid, releasing the amount pledged to the bider

# Running locally

## Getting started

1. Go to [Maestro](https://dashboard.gomaestro.org/) and get an API key
2. Create a `.env.development.local` file
3. Set the environment variable `NEXT_PUBLIC_MAESTRO_API_KEY`
4. Set the environment variable `NEXT_PUBLIC_NETWORK` to one of:

- Mainnet
- Preprod
- Preview

5. Run the development server: `npm run dev`
