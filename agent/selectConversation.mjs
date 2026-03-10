import readLineSync from 'readline-sync';
import colors from 'colors';

import Conversation from "../Models/conversations.mjs";

export default async function selectConversation(userId) {
    const convos = await Conversation.find({ userId }).sort({ lastUpdated: -1 });

    if (convos.length === 0) return null;

    console.log(colors.magenta("\n--- Your Past Conversations ---"));
    convos.forEach((c, index) => {
        console.log(`${index + 1}. ${c.title} (${new Date(c.lastUpdated).toLocaleDateString()})`);
    });
    console.log("0. Start a brand new chat");

    const choice = readLineSync.questionInt('\nChoose a number: ');
    if (choice === 0) return null;
    return convos[choice - 1]; // Return the selected document
}