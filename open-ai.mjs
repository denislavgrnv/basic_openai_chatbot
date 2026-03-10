import agent from "./agent-init.mjs";
import { run } from '@openai/agents';
import readLineSync from 'readline-sync';
import colors from 'colors';

import User from "./Models/users.mjs";
import Conversation from "./Models/conversations.mjs";
import selectConversation from "./selectConversation.mjs";
import connectDB from "./baseConnect.mjs";

async function startApp() {
    await connectDB();

    const user = await User.findOne({ firstName: "Alex" });
    if (!user) {
        console.log(colors.red("User not found. Please create the user first."));
        return;
    }

    const selectedConvo = await selectConversation(user._id);
    
    let userQuestion = readLineSync.question('\nYou: ');

    await main(user._id, userQuestion, selectedConvo);
}

async function main(userId, initialQuestion, conversationDoc) {
    let userQuestion = initialQuestion;
    
    let currentConvoId = conversationDoc ? conversationDoc._id : null;
    let summary = conversationDoc?.summary || "";
    let localMessages = conversationDoc 
        ? conversationDoc.messages.map(m => ({ role: m.role, content: m.content })) 
        : [];

    let titleText = "";
    if (!currentConvoId) {
        const titleResult = await run(agent, `Based on the first prompt from the user, set few words title for the conversation : ${userQuestion}`);
        titleText = titleResult.finalOutput;
    }


    while (userQuestion !== 'exit' && userQuestion !== 'quit' && userQuestion !== 'bye') {
        
        const historyString = localMessages
            .slice(-10) 
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join("\n");

        // Combine history + the new question into one plain string
        const combinedInput = `
            SYSTEM: Here is a summary of the past: ${summary}
            Recent context:
            ${historyString}
            
            USER: ${userQuestion}
        `;

        console.log(colors.gray("(Thinking...)"));

        try {
            const result = await run(agent, combinedInput);
            const aiResponse = result.finalOutput;

            if (!currentConvoId) {
                const newConvo = await Conversation.create({
                    userId: userId,
                    title: titleText,
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
                        },
                    },
                    $set: { 
                        lastUpdated: Date.now()
                    }
                });
                console.log(colors.yellow("[History Saved]"));
            }

            localMessages.push(
                { role: "user", content: userQuestion },
                { role: "assistant", content: aiResponse }
            );

            console.log(colors.blue(`ChatBot: ${aiResponse}`));

            // Update the DB with the new summary
            await Conversation.findByIdAndUpdate(currentConvoId, { $set: { summary: summary } });

        } catch (error) {
            console.error(colors.red("Error during AI run or DB save:"), error);
        }

        userQuestion = readLineSync.question('\nYou: ');
    }
    try {
        const summaryPrompt = `Summarize our entire conversation so far into 2 concise sentences using the currect chat history and the last summary for your own future reference, make it clean and don/'t fall into nonsense explanations: \n${localMessages.map(m => m.content).join(" ")} and the old summary : ${summary}`;
        const summaryResult = await run(agent, summaryPrompt);
                
        summary = summaryResult.finalOutput;
    
        await Conversation.findByIdAndUpdate(currentConvoId, { $set: { summary: summary } });
    } catch (error) {
        console.error(colors.red("Error generating summary:"), error);  
    }
    console.log(colors.magenta("Goodbye!"));
    process.exit(0);
}

startApp();