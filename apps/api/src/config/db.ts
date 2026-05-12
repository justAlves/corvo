import { drizzle as drizzleOrm } from "drizzle-orm/node-postgres";
import { env } from "./env";

const drizzle = drizzleOrm({
    connection: {
        connectionString: env.DATABASE_URL,
        //ssl: true
    }
})

export { 
    drizzle
}