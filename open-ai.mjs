import agent from "./agent-init.mjs";
import { run } from '@openai/agents';
import readLineSync from 'readline-sync';
import colors from 'colors';

import express from 'express';
import mongoose from 'mongoose';

import User from "./Models/users.mjs";
import Conversation from "./Models/conversations.mjs";

const app = express();
app.use(express.json());
try {
    mongoose.connect('mongodb://localhost:27017/ChatBot');
    console.log(colors.green('Connected to MongoDB!'));
    const PORT = 3000;
    app.listen(PORT);
} catch (error) {
    console.error(colors.red('Error connecting to MongoDB:', error));
}
let userQuestion = readLineSync.question('You: ');

const user = await User.findOne({ firstName: "Alex" });
main(user._id, userQuestion);

async function main(userId, userQuestion) {
    let currentConvoId = null;

    while (userQuestion !== 'exit' && userQuestion !== 'quit' && userQuestion !== 'bye') {
        const result = await run(agent, userQuestion);
        const aiResponse = result.finalOutput;

        try {
            if (!currentConvoId) {
                const newConvo = await Conversation.create({
                    userId: userId,
                    title: userQuestion.substring(0, 30) + "...",
                    messages: [
                        { role: "user", content: userQuestion },
                        { role: "assistant", content: aiResponse }
                    ]
                });
                currentConvoId = newConvo._id;
                console.log(colors.green("Started new conversation document."));
            } else {
                await Conversation.findByIdAndUpdate(currentConvoId, {
                    $push: { 
                        messages: { 
                            $each: [
                                { role: "user", content: userQuestion },
                                { role: "assistant", content: aiResponse }
                            ] 
                        } 
                    },
                    $set: { lastUpdated: Date.now() }
                });
                console.log(colors.yellow("Added messages to existing document."));
            }
        } catch (error) {
            console.error("Database error:", error);
        }

        console.log(colors.blue(`ChatBot: ${aiResponse}`));
        
        userQuestion = readLineSync.question('You: ');
    }
}