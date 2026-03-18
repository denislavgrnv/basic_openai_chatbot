import ChatHistorySideBar from './components/chat_history/ChatHistorySideBar.jsx';
import TypeWriter from './TypeWritter.jsx';
import api from '../api/requester.js';
import './chatbot.css';
import RegisterPage from './components/register/RegisterPage.jsx';
import LoginPage from './components/login/LoginPage.jsx';
import { useRef, useState, useEffect } from 'react';

export default function App() {
    const [user, setUser] = useState(() =>
        localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')) : null
    );
    const [input, setInput] = useState("");
    const [currentConvoId, setCurrentConvoId] = useState(null);
    const [sidebarRefresh, setSidebarRefresh] = useState(0);
    const [isLogin, setIsLogin] = useState(true);
    const [messages, setMessages] = useState([
        { id: 'welcome', text: "Hello! How can I help you today?", sender: "assistant", isNew: false }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input;
        setInput("");

        const userMsg = { id: Date.now(), text: userText, sender: "user", isNew: false };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const response = await api.post('http://localhost:5000/api/chat', {
                userId: user._id,
                userQuestion: userText,
                conversationId: currentConvoId
            });

            setIsTyping(false);

            const aiMsg = {
                id: Date.now() + 1,
                text: response.aiResponse,
                sender: "assistant",
                isNew: true
            };

            setMessages(prev => [...prev, aiMsg]);

            if (!currentConvoId) {
                setCurrentConvoId(response.conversationId);
            }

            setSidebarRefresh(prev => prev + 1);
        } catch (error) {
            console.error("Chat Error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { id: 'err', text: "Sorry, I'm having trouble connecting.", sender: "assistant", isNew: false }]);
        }
    };

    const loadConversation = async (convoFromSidebar) => {
        const conversationId = convoFromSidebar._id;
        if (conversationId === currentConvoId) return;

        setCurrentConvoId(conversationId);
        try {
            console.log(conversationId);

            const response = await api.get(`http://localhost:5000/api/conversation/${conversationId}`);
            const messagesToMap = response?.messages || response?.data?.messages;

            if (!messagesToMap) {
                console.error("No messages array found in response!");
                setMessages([]); // Set to empty so the UI doesn't crash
                return;
            }

            const formattedMessages = messagesToMap.map(m => ({
                id: m._id || Math.random(),
                text: m.content,
                sender: m.role === 'assistant' ? 'assistant' : 'user',
                isNew: false
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Load Error:", error);
        }
    };

    const handleNewChat = () => {
        setCurrentConvoId(null);
        setMessages([{ id: 'welcome', text: "Hello! How can I help you today?", sender: "assistant", isNew: false }]);
        setInput("");
    };

    const handleAuthSuccess = (userData) => {
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);

        setMessages([{ id: 'welcome', text: "Hello! How can I help you today?", sender: "assistant", isNew: false }]);
        setCurrentConvoId(null);
        setSidebarRefresh(prev => prev + 1);
    };

    const toggleView = () => {
        setIsLogin(!isLogin);
    };

    useEffect(() => {
        if (!user) {
            setMessages([{ id: 'welcome', text: "Hello! How can I help you today?", sender: "assistant", isNew: false }]);
            setCurrentConvoId(null);
        }
    }, [user?._id]);

    if (!user) {
        return (
            <div>
                {isLogin ? (
                    <LoginPage
                        onLoginSuccess={handleAuthSuccess}
                        switchToRegister={toggleView}
                    />
                ) : (
                    <RegisterPage
                        onRegisterSuccess={handleAuthSuccess}
                        switchToLogin={toggleView}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="app-layout">
            <ChatHistorySideBar
                onSelectConversation={loadConversation}
                onNewChat={handleNewChat}
                refreshTrigger={sidebarRefresh}
            />
            <main className="main-content">
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-row ${msg.sender}`}>
                            {msg.sender === 'assistant' && <span className="ai-star">✦</span>}
                            <div className="message-bubble">
                                {msg.isNew ? (
                                    <TypeWriter text={msg.text} />
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-row assistant">
                            <span className="ai-star">✦</span>
                            <div className="message-bubble typing">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
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
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            className={`send-btn ${isTyping ? 'thinking' : ''}`}
                            disabled={!input.trim() || isTyping}
                        >
                            ↑
                        </button>
                    </div>
                    <p className="disclaimer">
                        AI may display inaccurate info, so double-check its responses.
                    </p>
                </div>
                <button onClick={async () => {
                    try {
                        localStorage.removeItem('user_data');
                        setUser(null);
                        setSidebarRefresh(prev => prev + 1);
                        setMessages([{ id: 'welcome', text: "Hello! How can I help you today?", sender: "assistant", isNew: false }]);
                    } catch (err) {
                        console.error("Logout failed", err);
                    }
                }}>
                    Logout
                </button>
            </main>
        </div>
    );
}