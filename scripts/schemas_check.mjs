process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { Client } = require("pg");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL.replace("?pgbouncer=true&sslmode=no-verify", "?sslmode=require").replace(":5432", ":6543") });
    try {
        await client.connect();
        console.log("Connected to PostgreSQL successfully!");
        const res = await client.query("SELECT to_regclass('public.\"User\"');");
        if (res.rows[0].to_regclass) {
            console.log("User table exists. Db is ready to go.");
        } else {
            console.log("User table does NOT exist.");
        }
        await client.end();
    } catch (err) {
        console.error("PostgreSQL Connection Error:", err);
    }
}
check();
