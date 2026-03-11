import express from 'express';
import cors from 'cors';

import connectDB from './database/baseConnect.mjs';

import Conversation from './Models/conversations.mjs';
const app = express();

app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running and ready!');
});

app.get('/api/test', (req, res) => {
    res.json({ message: "Success! The frontend can see the backend." });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({ userId }).sort({ lastUpdated: -1 });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});