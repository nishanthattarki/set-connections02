require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Gemini SDK
// In Railway, set GEMINI_API_KEY in the environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Convert our generic chat history format into Gemini's expected format
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Create a chat session with Gemini
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash', // Using the fast and free Gemini model
      config: {
        systemInstruction: "You are a helpful and polite customer support assistant for SetConnect. Keep your answers brief and concise.",
      },
      history: formattedHistory
    });

    // Send the user's message
    const response = await chat.sendMessage({ message: message });
    const reply = response.text;

    res.json({ reply });
  } catch (error) {
    console.error('Error with Gemini API:', error);
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
