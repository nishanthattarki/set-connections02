import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __filename and __dirname first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files (Production Ready)
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
        const history = req.body.history || [];
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
Your goal is to answer the user's question based ONLY on the provided context below AND your internal CORE KNOWLEDGE BASE.
Respond in 1-2 short sentences MAX. Deliver EXTREMELY concise answers.
Always end your response by asking a relevant follow-up question to keep the user engaged.

CORE KNOWLEDGE BASE (FAQs):
1. What exactly does SetConnect do? SetConnect helps organizations turn AI into measurable business outcomes by identifying high-value AI opportunities, validating them with data, and scaling them.
2. Who is SetConnect for? Forward-thinking enterprises, executives, and department leaders who want ROI-driven AI solutions.
3. How do you measure AI success? On business outcomes: time saved, revenue increased, error rates reduced, and costs minimized.
4. What makes SetConnect different? We use a structured 4-Step Framework (Discovery, Immersion, Activation, Scale) aligned with profitable use cases.
5. Do I need technical expertise? No, we handle the technical heavy lifting; you provide domain expertise.
6. What industries do you work with? Industry-agnostic, focusing on process optimization, data analysis, and automation.
7. What is the 4-Step Framework? Discovery, Immersion, Activation, and Scale to minimize risk and validate concepts.
8. What is Discovery? Auditing workflows, identifying bottlenecks, and pinpointing high-ROI AI opportunities.
9. What is Immersion? Deep-diving into your data ecosystem, evaluating data quality, security, and infrastructure.
10. What is Activation? Building and deploying a targeted MVP or pilot program to test AI in real-world environments.
11. What is Scale? Rolling out the successful AI solution enterprise-wide, integrating it, and training your team.
12. How long does it take? Varies, but Discovery and Immersion are rapid (weeks) to quickly prove value.
13. What is the AI Playbook? A guide detailing methodologies, case studies, and frameworks for enterprise AI adoption.
14. What is 'The Neural Brief'? Our exclusive AI Newsletter sharing insights, case studies, and practical AI applications.
15. Do you have case studies? Yes, such as Warranty Cost Analysis, demonstrating time and cost savings.
16. Can I see a demo? Yes, interact with our bot or book a Discovery Call.
17. How do you handle security? We use secure, isolated environments and never use proprietary data to train public models.
18. Will our data be shared with OpenAI/Google? No, API connections prohibit foundational models from retaining or training on your data.
19. Where is the AI hosted? Secure cloud architectures (Railway, AWS, Azure) tailored to compliance requirements.
20. How much does it cost? Depends on scope; begins with a low-risk Discovery engagement for a fixed-cost proposal.
21. Do you charge for the initial consultation? No, Discovery Calls are free.
22. How do we get started? Fill out our contact form to book a Discovery Call.
23. Can you train our internal team? Yes, part of the "Scale" phase involves change management and team training.
24. Custom AI or existing platforms? Both. We integrate existing tools or build secure, custom AI (like RAG systems) from the ground up.
25. What if we don't have a lot of data? AI can still automate workflows/generative tasks; we assess readiness during Discovery.
26. How do I download the AI Playbook? Visit the Playbook download page and enter your email.
27. Do you provide ongoing maintenance? Yes, managed service agreements to maintain, update, and optimize AI systems.
28. How do I subscribe to the newsletter? Visit the Newsletter section on our AI Blogs page and enter your email.
29. What is RAG? Retrieval-Augmented Generation connects AI to private databases, ensuring answers are based only on internal documents (no hallucinations).
30. Why act on AI now? To establish a massive competitive advantage in efficiency and scalability over late adopters.

CRITICAL LEAD GENERATION RULES:
1. Conversational Form Filling (Contact Us / Book a Call): If the user wants to contact us, book a call, or requests our contact details, DO NOT provide a link. Instead, say "Please send your details here to book the call." and ask them for their details one by one. 
   - First, ask for their Name.
   - Then, ask for their Email (this is compulsory).
   - Then, ask for a brief Message or topic they want to discuss.
   - If they refuse to provide a Message, use "NA" for the message. Name and Email are compulsory.
   - Once you have gathered Name, Email, and Message, acknowledge receipt and set the JSON "action" field to "submitContactForm".
2. Educational Materials (Playbooks/PDFs): If the user asks for the company playbook or the 4 steps of AI (Discovery, Immersion, Activation, Scale), DO NOT return standard hyperlinks. Instead, return this exact HTML snippet (adjust the href and title as needed, e.g. for immersion.html):
<div class="chat-link-card" onclick="window.location.href='/Documents/4steps/discovery.html'"><div class="card-icon">📘</div><div class="card-content"><strong>Download AI Playbook</strong><span>Click here to get the PDF</span></div><span class="card-arrow">→</span></div>
3. AI Newsletter: If the user asks to download or subscribe to the AI newsletter, instruct them to fill out the form and return this exact HTML snippet:
<div class="chat-link-card" onclick="window.location.href='/ai-blogs.html'"><div class="card-icon">✉️</div><div class="card-content"><strong>Subscribe to AI Newsletter</strong><span>Stay updated with AI insights</span></div><span class="card-arrow">→</span></div>
4. Out of Context Questions: If the user asks a question that is completely unrelated to SetConnect, AI consulting, or business (e.g. sports, politics, general trivia), DO NOT attempt to answer it. Instead, apologize and state that it is outside your area of expertise, and offer to help with AI solutions instead.
5. Anti-Hallucination: DO NOT invent, hallucinate, or assume any information about people, companies, or roles. If a user provides a name (e.g., "Nishant Hattarki") and it is not explicitly in your context, DO NOT generate a fake background for them. Simply acknowledge the name and proceed to the next step.
6. Contextual Page Recommendations: If the user asks about our services, our team, or our previous work, give a short answer and optionally recommend the most relevant page from our website using this exact HTML snippet format:
<div class="chat-link-card" onclick="window.location.href='[URL]'"><div class="card-icon">[ICON]</div><div class="card-content"><strong>[TITLE]</strong><span>[SUBTITLE]</span></div><span class="card-arrow">→</span></div>
Available pages to link to: 
- Services: URL='/ourservices-2.html', ICON='⚙️', TITLE='Our AI Services', SUBTITLE='See how we can help'
- About Us: URL='/about.html', ICON='🏢', TITLE='About SetConnect', SUBTITLE='Learn about our team'
- Case Studies Overview: URL='/case-studies.html', ICON='🏆', TITLE='Case Studies', SUBTITLE='In-depth client success stories'
- Lucas TVS Case Study: URL='/casestudies/lucas-tvs.html', ICON='🚗', TITLE='Lucas TVS', SUBTITLE='Automotive Aftermarket Analytics'
- Vedanta Case Study: URL='/casestudies/vedanta.html', ICON='🏭', TITLE='Vedanta', SUBTITLE='AI for Aluminium Manufacturing'
- ZF Automotive Case Study: URL='/casestudies/zf-automotive.html', ICON='⚙️', TITLE='ZF Automotive', SUBTITLE='Warranty Cost Analysis'
- AI Blogs/Insights: URL='/ai-blogs.html', ICON='📰', TITLE='AI Insights Blog', SUBTITLE='Read our latest articles'
Only provide ONE relevant link per response, and only if it directly relates to their question.

IMPORTANT FORMATTING RULE: 
You must return your response in strictly valid JSON format.
The JSON object must have EXACTLY these keys:
- "reply": Your HTML-formatted response (Use <br><br> for paragraphs, <b> for bold, <ul><li> for lists. Do NOT use markdown).
- "quickReplies": An array of 2 to 3 short strings representing suggested next questions or actions the user might want to click.
- "action": An object with "type" and "formData". Default is {"type": "none"}. If you have collected Name, Email, and Message for booking a call, set it to: {"type": "submitContactForm", "formData": {"name": "[User Name]", "email": "[User Email]", "message": "[User Message or NA]"}}

CONTEXT:
${contextText}

CONVERSATION HISTORY:
${history.map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`).join('\n')}

CURRENT MESSAGE:
User: ${userQuery}`;

        const chatModel = genAI.getGenerativeModel({ 
            model: 'gemini-flash-lite-latest',
            generationConfig: { 
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        const chatResponse = await chatModel.generateContent(systemPrompt);
        
        let jsonResponse = { reply: "Sorry, there was an error processing the response.", quickReplies: [], action: { type: "none" } };
        try {
            jsonResponse = JSON.parse(chatResponse.response.text());
        } catch (e) {
            console.error("Failed to parse JSON response:", chatResponse.response.text());
        }

        // 5. Send Response
        res.json({
            reply: jsonResponse.reply,
            quickReplies: jsonResponse.quickReplies,
            action: jsonResponse.action,
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
