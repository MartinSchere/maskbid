import { createKysely } from "@vercel/postgres-kysely";
import { DB } from "./db-types";

export const db = createKysely<DB>();
