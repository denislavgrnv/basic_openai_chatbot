import express from 'express';
import cors from 'cors';

import connectDB from './database/baseConnect.mjs';

import {run } from '@openai/agents';
import agent from './agent/agent-init.mjs'; 
import { createConversation, deleteConversation, findConversationsByUserId, findCurrentConversation, updateConversation } from './controllers/chat-conversations.mjs';
import {createUser} from './controllers/user-controller.mjs';
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
        const conversations = await findConversationsByUserId(userId);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('/api/conversations/:conversationId', async (req, res) => {
    try {
        const convo = await findCurrentConversation(req.params.conversationId);
        if (!convo) return res.status(404).send("Not found");
        res.json(convo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat', async (req, res) => {
    const { userId, userQuestion, conversationId } = req.body;

    try {
        let convo = await findCurrentConversation(conversationId);
        
        const historyString = convo?.messages.slice(-6)
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join("\n") || "";

        const combinedInput = `
            SYSTEM: Previous Summary: ${convo?.summary || "None"}
            Recent History:
            ${historyString}
            
            USER: ${userQuestion}
        `;

        const result = await run(agent, combinedInput);
        const aiResponse = result.finalOutput;

        if (!convo) {
            const titleResult = await run(agent, `Generate a very short title for this topic: ${userQuestion}`);
            const firstSummary = await run(agent, `Summarize this conversation in 1-2 sentences:}\nUser Question: ${userQuestion}\nAI Answer: ${aiResponse}`);
            
            convo = await createConversation(userId, userQuestion, aiResponse, titleResult, firstSummary);
        } else {
            const summary = await run(agent, `Summarize this conversation in 1-2 sentences:}\nUser Question: ${userQuestion}\nAI Answer: ${aiResponse}, combine it with last summary: ${convo.summary}`);
            await updateConversation(conversationId, userQuestion, aiResponse, summary.finalOutput);
        }

        res.json({ 
            aiResponse: aiResponse, 
            conversationId: convo._id 
        });


    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({ error: "The AI agent encountered an issue." });
    }
});
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Register attempt for:", email);
    try {
        const newUser = await createUser({ name, email, password });
        res.status(201).json({ 
            user: { 
                _id: newUser._id, 
                name: newUser.name, 
                email: newUser.email 
            } 
        });
    } catch (error) {
        console.error("User Creation Error:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.delete('/api/conversations/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;

        const deletedConversation = await deleteConversation(conversationId);

        if (!deletedConversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete conversation" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});