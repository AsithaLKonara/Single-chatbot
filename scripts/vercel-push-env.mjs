import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
let content;
try {
    content = fs.readFileSync(envLocalPath, "utf-8");
} catch (e) {
    console.error("Could not read .env.local:", e);
    process.exit(1);
}

const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    let key = match[1].trim();
    let value = match[2].trim();
    
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
    }
    
    console.log(`Adding ${key}...`);
    for (const envName of ['production', 'preview', 'development']) {
        try {
            // Remove existing key if it exists
            try { execSync(`npx vercel env rm ${key} ${envName} -y`, { stdio: 'ignore' }); } catch(e) {}
            
            // Add new key
            execSync(`npx vercel env add ${key} ${envName}`, {
                input: value,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            console.log(`Successfully added ${key} to ${envName}`);
        } catch (e) {
            console.error(`Failed to add ${key} to ${envName}:`, e.message);
        }
    }
}
console.log("Finished pushing environment variables to Vercel!");
