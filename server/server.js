import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files (Production Ready)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'setconnect_db';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'knowledge_base';

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// MongoDB Client
const client = new MongoClient(MONGODB_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
}
connectDB();

app.post('/api/chat', async (req, res) => {
    try {
        const userQuery = req.body.message;
        if (!userQuery) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Generate Embedding for the User's Query
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
        const embeddingResult = await embeddingModel.embedContent(userQuery);
        const queryVector = embeddingResult.embedding.values;

        // 2. Perform Vector Search in MongoDB
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Note: You MUST create a Vector Search Index in MongoDB Atlas named 'vector_index' 
        // for this to work.
        const searchResults = await collection.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: 5
                }
            },
            {
                $project: {
                    _id: 0,
                    text: 1,
                    source: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]).toArray();

        // 3. Construct Context for the LLM
        let contextText = searchResults.map(doc => `Source (${doc.source}):\n${doc.text}`).join('\n\n---\n\n');
        
        if (!contextText) {
            contextText = "No specific relevant context found in the database.";
        }

        // 4. Generate Response using Gemini
        const systemPrompt = `You are a helpful, professional, and concise customer support AI assistant for SetConnect.
Your goal is to answer the user's question based ONLY on the provided context below.
If the context does not contain the answer, politely say that you don't have that specific information and offer a general helpful response or suggest they contact support.
Do not invent or hallucinate information.

IMPORTANT FORMATTING RULE: 
Format your entire response using clean HTML. Use <br><br> for paragraphs, <b> for bold text, and <ul><li> for bullet points. Do NOT use Markdown (like ** for bold).
CRITICAL: Do NOT wrap your response in markdown code blocks like \`\`\`html. Just output the raw text directly.

CONTEXT:
${contextText}

User Question: ${userQuery}`;

        const chatModel = genAI.getGenerativeModel({ 
            model: 'gemini-flash-lite-latest',
            generationConfig: { temperature: 0.2 }
        });

        const chatResponse = await chatModel.generateContent(systemPrompt);

        // 5. Send Response
        res.json({
            reply: chatResponse.response.text(),
            sources: searchResults.map(doc => doc.source) // Optionally return sources
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        if (error.cause) {
            console.error('Underlying Fetch Cause:', error.cause);
        }
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
