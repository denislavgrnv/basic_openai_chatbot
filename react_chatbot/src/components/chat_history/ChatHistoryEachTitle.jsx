import { useEffect, useState } from "react";
import { getConversations } from "../../../hooks/chats";

export default function ChatHistoryEachTitle({ onSelect }) {
    const [conversations, setConversations] = useState([]);
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const convos = await getConversations();
                setConversations(convos);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, []);
    return (
        <div className="history-list">
            {conversations.map((chat) => (
                <div key={chat._id} className="history-item" onClick={() => onSelect(chat)}>
                    {chat.title}
                </div>
            ))}
        </div>
    );
}