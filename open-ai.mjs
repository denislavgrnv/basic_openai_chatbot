import agent from "./agent-init.mjs";
import { run } from '@openai/agents';
import readLineSync from 'readline-sync';
import colors from 'colors';
import mongoose from 'mongoose';

import User from "./Models/users.mjs";
import Conversation from "./Models/conversations.mjs";
import selectConversation from "./selectConversation.mjs";

// 1. Database Connection Logic
async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ChatBot');
        console.log(colors.green('Connected to MongoDB!'));
    } catch (error) {
        console.error(colors.red('Error connecting to MongoDB:', error));
        process.exit(1);
    }
}

async function startApp() {
    await connectDB();

    const user = await User.findOne({ firstName: "Alex" });
    if (!user) {
        console.log(colors.red("User 'Alex' not found. Please create the user first."));
        return;
    }

    const selectedConvo = await selectConversation(user._id);
    
    let userQuestion = readLineSync.question('\nYou: ');

    await main(user._id, userQuestion, selectedConvo);
}

async function main(userId, initialQuestion, conversationDoc) {
    let userQuestion = initialQuestion;
    
    let currentConvoId = conversationDoc ? conversationDoc._id : null;
    
    // Maintain a local array of messages for the "Short-term memory"
    let localMessages = conversationDoc 
        ? conversationDoc.messages.map(m => ({ role: m.role, content: m.content })) 
        : [];

    while (userQuestion !== 'exit' && userQuestion !== 'quit' && userQuestion !== 'bye') {
        
        const historyString = localMessages
            .slice(-10) 
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join("\n");

        // Combine history + the new question into one plain string
        const combinedInput = `System: Use the following history for context.\n\n${historyString}\n\nUser: ${userQuestion}`;

        console.log(colors.gray("(Thinking...)"));

        try {
            const result = await run(agent, combinedInput);
            const aiResponse = result.finalOutput;

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
                console.log(colors.green("[New Conversation Created]"));
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
                console.log(colors.yellow("[History Saved]"));
            }

            localMessages.push(
                { role: "user", content: userQuestion },
                { role: "assistant", content: aiResponse }
            );

            console.log(colors.blue(`ChatBot: ${aiResponse}`));

        } catch (error) {
            console.error(colors.red("Error during AI run or DB save:"), error);
        }

        userQuestion = readLineSync.question('\nYou: ');
    }
    console.log(colors.magenta("Goodbye!"));
    process.exit(0);
}

startApp();