process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Client } from "pg";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function run() {
    const client = new Client({ 
        connectionString: process.env.DATABASE_URL.replace("?pgbouncer=true", "?sslmode=require").replace(":5432", ":6543").replace("&connection_limit=1", "") 
    });

    try {
        await client.connect();
        
        const email = "demo@system.ai";
        const password = "demo";
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if user exists
        const check = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log("Demo user already exists. Updating password to ensure access...");
            await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [hashedPassword, email]);
            console.log("Demo user password reset to 'demo'.");
        } else {
            const id = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 15));
            await client.query(
                'INSERT INTO "User" (id, email, password, role, plan, "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW())', 
                [id, email, hashedPassword, "USER", "PRO"]
            );
            console.log("Demo user successfully created!");
        }
        await client.end();
    } catch (e) {
        console.error("Postgres execution error:", e);
    }
}
run();
