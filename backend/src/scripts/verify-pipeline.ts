
import fs from "fs";
import path from "path";

// 1. Load Env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
            const key = line.substring(0, eqIdx).trim();
            let val = line.substring(eqIdx + 1).trim();
            val = val.replace(/^["'](.+)["']$/, '$1');
            process.env[key] = val;
        }
    });
}

async function main() {
    console.log("--- SYNTHETIC VERIFICATION ---");
    try {
        const { saveDocuments, getRetriever } = await import("../utils/database/db");
        const { embeddings } = await import("../utils/llm/llm");

        // 2. Check Dimension
        const vector = await embeddings.embedQuery("test");
        console.log(`Embedding Dimension: ${vector.length}`);

        // 3. Mock Document
        console.log("Saving mock document...");
        const docs = [{
            pageContent: "This is a synthetic test document about AI and Supabase.",
            metadata: { source: "synthetic", type: "test" }
        }];

        await saveDocuments("global", docs as any, embeddings);
        console.log("Save successful.");

        // 4. Retrieve
        console.log("Retrieving...");
        const retriever = await getRetriever("global", embeddings);
        const results = await retriever.invoke("synthetic");

        console.log(`Found ${results.length} results.`);
        console.log("Top result:", results[0]?.pageContent);
        console.log("--- SUCCESS ---");

    } catch (err: any) {
        console.error("--- FAILURE ---");
        console.error(err.message);
        if (err.message && err.message.includes("match_documents")) {
            console.error("TIP: The function 'match_documents' is missing or has the wrong signature.");
        }
    }
}

main();
