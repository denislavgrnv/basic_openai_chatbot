import { useEffect, useState, useCallback } from "react";
import { getConversations } from "../../../hooks/chats";
import { delConvesations } from "../../../hooks/chats";

export default function ChatHistoryEachTitle({ onSelect, refreshTrigger }) {
    const [conversations, setConversations] = useState([]);
    const [user, setUser] = useState(() =>
        localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')) : null
    );
    const fetchConversations = useCallback(async () => {
        try {
            const convos = await getConversations(user._id);
            setConversations(convos);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    }, [user._id]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations, refreshTrigger]);

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Stops the chat from opening
        if (window.confirm("Are you sure you want to delete this chat?")) {
            try {
                await delConvesations(id);
                fetchConversations();
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    return (
        <div className="history-list">
            {conversations.map((chat) => (
                <div
                    key={chat._id}
                    className="history-item"
                    onClick={() => onSelect(chat)}
                >
                    <span className="chat-title">{chat.title}</span>

                    <button
                        className="delete-chat-btn"
                        onClick={(e) => handleDelete(e, chat._id)}
                        title="Delete Chat"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}