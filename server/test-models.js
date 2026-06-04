import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite-001',
    'gemma-4-26b-a4b-it',
    'gemini-flash-lite-latest',
    'gemini-pro-latest',
    'gemini-3.1-flash-lite'
];

async function runTests() {
    console.log("Testing which chat models are unlocked for your key...");
    
    for (const modelName of modelsToTest) {
        console.log(`\nTesting: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say the word 'Hello'");
            console.log(`✅ SUCCESS! ${modelName} works. Reply: ${result.response.text()}`);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message.split('\\n')[0]}`);
        }
        // Small delay
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("\nFinished testing!");
}

runTests();
