require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI SDK
// In Railway, set OPENAI_API_KEY in the environment variables
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Build the messages array for OpenAI
    const messages = [
      { role: 'system', content: 'You are a helpful and polite customer support assistant for SetConnect. Keep your answers brief and concise.' },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'llama3-8b-8192', // Using Groq's free and fast Llama 3 model
      messages: messages,
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to communicate with the chatbot service.' });
  }
});

// Basic health check route
app.get('/', (req, res) => {
  res.send('Chatbot Backend is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
