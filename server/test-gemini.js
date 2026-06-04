import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    console.log("Testing text-embedding-004...");
    try {
        const model1 = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        await model1.embedContent("test");
        console.log("✅ text-embedding-004 SUCCESS");
    } catch (e) {
        console.log("❌ text-embedding-004 FAILED:", e.message);
    }

    console.log("Testing embedding-001...");
    try {
        const model2 = genAI.getGenerativeModel({ model: 'embedding-001' });
        await model2.embedContent("test");
        console.log("✅ embedding-001 SUCCESS");
    } catch (e) {
        console.log("❌ embedding-001 FAILED:", e.message);
    }
}
test();
