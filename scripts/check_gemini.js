const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually parse .env to avoid dependency if possible, or just require dotenv if installed.
// The user did npm install, so dotenv might not be there if it's not in package.json devDeps?
// Next.js has dotenv built-in but for a standalone script we need 'dotenv' package.
// Let's assume user might not have 'dotenv' installed globally or in deps if strict.
// We'll read the file directly to be safe.

function loadEnv() {
    try {
        const content = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value && key.trim() === 'GEMINI_API_KEY') {
                process.env.GEMINI_API_KEY = value.trim().replace(/"/g, ''); // gentle cleanup
            }
        });
    } catch (e) {
        console.log("Could not read .env");
    }
}

loadEnv();

async function main() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }
    console.log("Checking models for key starting with:", key.substring(0, 5));

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error("API Error:", res.status, res.statusText);
            const txt = await res.text();
            console.error(txt);
        } else {
            const data = await res.json();
            console.log("--- AVAILABLE MODELS ---");
            if (data.models) {
                data.models.forEach(m => {
                    // Filter for generateContent support
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(m.name.replace('models/', ''));
                    }
                });
            } else {
                console.log("No models field in response");
                console.log(data);
            }
        }
    } catch (e) {
        console.error("Script failed", e);
    }
}

main();

//node scripts/check_gemini.js
