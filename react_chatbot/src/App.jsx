import { useState } from 'react';
import './chatbot.css';
import ChatHistorySideBar from './components/chat_history/ChatHistorySideBar.jsx';
import api from '../api/requester.js'; // Import your requester

export default function App() {
    const [input, setInput] = useState("");
    const [currentConvoId, setCurrentConvoId] = useState(null);
    const [sidebarRefresh, setSidebarRefresh] = useState(0);
    const [messages, setMessages] = useState([
        { id: 'welcome', text: "Hello! How can I help you today?", sender: "assistant" }
    ]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        setInput("");

        // 1. Show User Message in UI instantly
        const userMsg = { id: Date.now(), text: userText, sender: "user" };
        setMessages(prev => [...prev, userMsg]);

        try {
            const response = await api.post('http://localhost:5000/api/chat', {
                userId: "69adb2ba905f4761f8ea2c44",
                userQuestion: userText,
                conversationId: currentConvoId
            });

            const aiMsg = {
                id: Date.now() + 1,
                text: response.aiResponse,
                sender: "assistant"
            };

            if (!currentConvoId) {
                setCurrentConvoId(response.conversationId);
                setSidebarRefresh(prev => prev + 1); // This tells the sidebar to re-fetch
            }

            setMessages(prev => [...prev, aiMsg]);

            if (!currentConvoId) {
                setCurrentConvoId(response.conversationId);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { id: 'err', text: "Sorry, I'm having trouble connecting.", sender: "assistant" }]);
        }
    };

    const loadConversation = (convo) => {
        setCurrentConvoId(convo._id);

        const formattedMessages = convo.messages.map(m => ({
            id: m._id,
            text: m.content,
            sender: m.role === 'assistant' ? 'ai' : 'user'
        }));

        setMessages(formattedMessages);
    };

    const handleNewChat = () => {
        setCurrentConvoId(null);
        setMessages([
            { id: 'welcome', text: "Started a new chat. What's on your mind?", sender: "assistant" }
        ]);
        setInput("");
    };

    return (
        <div className="app-layout">
            <ChatHistorySideBar onSelectConversation={loadConversation} onNewChat={handleNewChat} refreshTrigger={sidebarRefresh} />
            <main className="main-content">
                <header className="assistant-header">
                    <span>AI Assistant</span>
                </header>

                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-row ${msg.sender}`}>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="input-container">
                    <div className="chat-input-wrapper">
                        <input
                            type="text"
                            className="user-input"
                            placeholder="Enter a prompt here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="send-btn"></button>
                    </div>
                    <p className="disclaimer">
                        AI may display inaccurate info, so double-check its responses.
                    </p>
                </div>
            </main>
        </div>
    );
}