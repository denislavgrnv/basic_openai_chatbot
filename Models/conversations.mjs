import { Schema, model } from "mongoose";

const conversationSchema = new Schema({
    // Link this conversation to a specific User
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: "New Conversation"
    },
    summary: {
        type: String,
        default: "nothing yet"
    },
    messages: [
        {
            role: { type: String, enum: ["user", "assistant"], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Conversation = model("Conversation", conversationSchema);

export default Conversation;