import Conversation from "../Models/conversations.mjs";

export const createConversation = async (userId, userQuestion, aiResponse, titleResult, firstSummary) => {
    const convo = await Conversation.create({
        userId: userId,
        title: titleResult.finalOutput,
        messages: [
            { role: "user", content: userQuestion },
            { role: "assistant", content: aiResponse }
        ],
        summary: firstSummary.finalOutput,
        lastUpdated: Date.now()
    });
    return convo;
}

export const updateConversation = async (conversationId, userQuestion, aiResponse, summary) => {
    await Conversation.findByIdAndUpdate(conversationId, {
        $push: {
            messages: { 
                $each: [
                    { role: "user", content: userQuestion },
                    { role: "assistant", content: aiResponse }
                ] 
            }
        },
        $set: { lastUpdated: Date.now(), summary: summary, }
    });
}

export const findConversationsByUserId = async (userId) => {
    return await Conversation.find({ userId }).sort({ lastUpdated: -1 });
}

export const findCurrentConversation = async (conversationId) => {
    return await Conversation.findById(conversationId);
}