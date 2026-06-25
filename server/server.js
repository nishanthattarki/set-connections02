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

        // Enhance the query with context for better vector search results
        const searchQuery = `SetConnect: ${userQuery}`;

        // 1. Generate Embedding for the User's Query
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
        const embeddingResult = await embeddingModel.embedContent(searchQuery);
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
        const systemPrompt = `You are a SetConnect representative, an AI assistant embodying the company's professional and innovative brand.
Your goal is to answer the user's question based ONLY on the provided context below.
Respond in 1-2 short sentences MAX. Deliver EXTREMELY concise answers.
Always end your response by asking a relevant follow-up question to keep the user engaged.

CRITICAL LEAD GENERATION RULES:
1. Contact & Booking Links: If the user asks to contact us, book a call, or requests our contact details, DO NOT provide plain text emails or phone numbers. Instead, provide a functional hyperlink to our form: <a href="/contact.html" style="color: #0891b2; font-weight: bold; text-decoration: underline;">Contact Us / Book a Call</a>.
2. Educational Materials (Playbooks/PDFs): If the user asks for the company playbook, provide this link to its gating form: <a href="https://set-connections02-production-af65.up.railway.app/Documents/4steps/discovery.html" style="color: #0891b2; font-weight: bold; text-decoration: underline;">Download AI Playbook</a>. If they ask about the 4 steps of AI (Discovery, Immersion, Activation, Scale), link them to the specific PDF form: <a href="/Documents/4steps/discovery.html" style="color: #0891b2; font-weight: bold; text-decoration: underline;">Download Discovery PDF</a> (or immersion.html, activation.html, scale.html respectively).
3. AI Newsletter: If the user asks to download or subscribe to the AI newsletter, instruct them to fill out the form to get access, and provide this hyperlink: <a href="/ai-blogs.html" style="color: #0891b2; font-weight: bold; text-decoration: underline;">Subscribe to AI Newsletter</a>.

IMPORTANT FORMATTING RULE: 
You must return your response in strictly valid JSON format.
The JSON object must have exactly two keys:
- "reply": Your HTML-formatted response (Use <br><br> for paragraphs, <b> for bold, <ul><li> for lists. Do NOT use markdown).
- "quickReplies": An array of 2 to 3 short strings representing suggested next questions or actions the user might want to click.

CONTEXT:
${contextText}

User Question: ${userQuery}`;

        const chatModel = genAI.getGenerativeModel({ 
            model: 'gemini-flash-lite-latest',
            generationConfig: { 
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        const chatResponse = await chatModel.generateContent(systemPrompt);
        
        let jsonResponse = { reply: "Sorry, there was an error processing the response.", quickReplies: [] };
        try {
            jsonResponse = JSON.parse(chatResponse.response.text());
        } catch (e) {
            console.error("Failed to parse JSON response:", chatResponse.response.text());
        }

        // 5. Send Response
        res.json({
            reply: jsonResponse.reply,
            quickReplies: jsonResponse.quickReplies,
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
