import { Ledger } from "./ledger";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';


export class Repo {
    private db = drizzle(process.env.DATABASE_URL!);

    public constructor() {
    }

    public get() {
        
    }
}