import { useEffect, useState } from "react";

export default function ChatHistorySideBar() {
    const [conversations, setConversations] = useState([]);
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/conversations/69adb2ba905f4761f8ea2c44');

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Server returned an error page:", errorText);
                    return;
                }
                const convos = await response.json();
                setConversations(convos);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, []);

    return (
        <aside className="sidebar">
            <button className="new-chat-btn">+ New Chat</button>

            <div className="history-label">Recent</div>

            <div className="history-list">
                {conversations.map((chat) => (
                    <div key={chat._id} className="history-item">
                        {chat.title}
                    </div>
                ))}
            </div>
        </aside>
    );
}