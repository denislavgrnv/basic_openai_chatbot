import express from 'express';
import cors from 'cors';

import connectDB from './database/baseConnect.mjs';

import {run } from '@openai/agents';
import {agent, agent2} from './agent/agent-init.mjs'; 

import { createConversation, deleteConversation, findByIdAndUpdate, findConversationsByUserId, findCurrentConversation, updateConversation } from './controllers/chat-conversations.mjs';
import {createUser, findUserByEmailAndPassword, findUserById} from './controllers/user-controller.mjs';
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

app.get('/api/conversation/:conversationId', async (req, res) => {
    try {
        const convo = await findCurrentConversation(req.params.conversationId);
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

        const result = await run(agent2, combinedInput);
        const aiResponse = result.finalOutput;

        if (!convo) {
            const titleResult = await run(agent2, `Generate a very short title for this topic: ${userQuestion}`);
            const firstSummary = await run(agent2, `Summarize this conversation in 1-2 sentences:}\nUser Question: ${userQuestion}\nAI Answer: ${aiResponse}`);
            
            convo = await createConversation(userId, userQuestion, aiResponse, titleResult, firstSummary);
        } else {
            const summary = await run(agent2, `Summarize this conversation in 1-2 sentences:}\nUser Question: ${userQuestion}\nAI Answer: ${aiResponse}, combine it with last summary: ${convo.summary}`);
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

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    try {
        const user = await findUserByEmailAndPassword(email, password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({ 
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error("User Login Error:", error);
        res.status(500).json({ error: "Failed to login user" });
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

app.put("/api/chat/guest", async (req, res) => {
    const { userQuestion, historySummary } = req.body;

    try {
        const memoryPrompt = historySummary 
            ? `Context of previous conversation: ${historySummary}\n\nNew User Question: ${userQuestion}`
            : userQuestion;

        const result = await run(agent, memoryPrompt);
        const aiResponse = result.finalOutput;

        let registrationData =  result.state;

        const toolCall = result.state?._lastProcessedResponse?.toolsUsed?.find(
            item => item.name === 'initiate_registration'
        );

        if (toolCall) {
            registrationData = toolCall.args; 
        }

        const updateSummaryPrompt = `Current Summary: ${historySummary || "None"}\nNew Interaction: User said "${userQuestion}", AI said "${aiResponse}"\nCreate a new, concise summary.`;
        const summaryResult = await run(agent, updateSummaryPrompt);
        const newSummary = summaryResult.finalOutput;

        res.json({ 
            aiResponse, 
            newSummary,
            registrationData // This triggers the modal in React
        });

    } catch (error) {
        console.error("Guest AI Route Error:", error);
        res.status(500).json({ error: "The AI agent encountered an issue." });
    }
});

app.put("/api/conversation/:conversationId", async (req, res) => {
    const { conversationId } = req.params;
    const { title } = req.body;

    // Validation: Ensure title is not empty
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const updatedConversation = await findByIdAndUpdate(
            conversationId,
            { title: title.trim() },
            { new: true } 
        );

        if (!updatedConversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.json(updatedConversation);

    } catch (error) {
        console.error("Rename Error:", error);
        res.status(500).json({ error: "Server error while renaming conversation" });
    }
});

app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // const isMatch = await bcrypt.compare(currentPassword, user.password);
        // if (!isMatch) {
        //     return res.status(401).json({ message: "Incorrect current password" });
        // }

        // 3. Update the Name
        if (name) user.name = name;

        // 4. Update Password (only if a new one was provided)
        // if (newPassword && newPassword.trim() !== "") {
        //     const salt = await bcrypt.genSalt(10);
        //     user.password = await bcrypt.hash(newPassword, salt);
        // }
        if (email) user.email = email;

        await user.save();

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isGuest: false
        };

        res.json(userResponse);

    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Server error during update" });
    }
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});