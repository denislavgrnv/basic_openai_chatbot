import { useEffect, useState, useCallback } from "react";
import { getConversations } from "../../../hooks/chats";
import { delConvesations } from "../../../hooks/chats";
import api from "../../../api/requester";

export default function ChatHistoryEachTitle({ onSelect, refreshTrigger }) {
    const [conversations, setConversations] = useState([]);
    const [user, setUser] = useState(() =>
        localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')) : null
    );
    const [editingId, setEditingId] = useState(null);
    const [tempTitle, setTempTitle] = useState("");

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
    const handleEdit = (e, chat) => {
        e.stopPropagation();
        setEditingId(chat._id);
        setTempTitle(chat.title);
    };

    // Function to save the changes
    const saveRename = async (id) => {
        if (!tempTitle.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await api.put(`http://localhost:5000/api/conversation/${id}`, {
                title: tempTitle
            });
            fetchConversations(); // Refresh list
        } catch (err) {
            console.error("Rename failed", err);
        } finally {
            setEditingId(null);
        }
    };

    return (
        <div className="history-list">
            {conversations.map((chat) => (
                <div
                    key={chat._id}
                    className={`history-item ${editingId === chat._id ? 'is-editing' : ''}`}
                    onClick={() => editingId !== chat._id && onSelect(chat)}
                >
                    {editingId === chat._id ? (
                        <input
                            className="edit-title-input"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={() => saveRename(chat._id)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRename(chat._id)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="chat-title">{chat.title}</span>
                    )}

                    <div className="history-item-actions">
                        <button
                            className="edit-chat-btn"
                            onClick={(e) => handleEdit(e, chat)}
                            title="Edit chat"
                        >
                            ✎
                        </button>
                        <button
                            className="delete-chat-btn"
                            onClick={(e) => handleDelete(e, chat._id)}
                            title="Delete Chat"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}