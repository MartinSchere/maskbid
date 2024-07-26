# Martin's Cardano template

A template to bootstrap Cardano projects using Nextjs (app router), Blaze, Shadcn/ui & Maestro.

## Getting started

1. Go to [Maestro](https://dashboard.gomaestro.org/) and get an API key
2. Create a `.env.development.local` file
3. Set the environment variable `NEXT_PUBLIC_MAESTRO_API_KEY`
4. Set the environment variable `NEXT_PUBLIC_NETWORK` to one of:

- mainnet
- preprod
- preview

5. Run the development server: `npm run dev`

## Getting a Blaze instance

To get a blaze instance, there is a function exported called `getBlaze`:

```ts
import { getBlaze } from "@/lib/blaze";

await getBlaze(wallet);
```

## Generating blueprint types

1. cd into the `contracts` folder
2. Build the project with `aiken build`
3. Generate types with `npx @blaze-cardano/blueprint ./plutus.json -o src/utils/plutus.ts`
