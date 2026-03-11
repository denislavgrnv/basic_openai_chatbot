import './chatbot.css'
import ChatHistorySideBar from './chat_history/ChatHistorySideBar';
function App() {

    return (
        <div className="app-layout"> {/* The 'Father' wrapper */}
            <ChatHistorySideBar />

            <main className="main-content">
                <header className="assistant-header">
                    <span>AI Assistant</span>
                </header>

                <div className="chat-messages">
                    <div className="message-wrapper">
                        <p style={{ color: '#666' }}>Hello! How can I help you today?</p>
                    </div>
                </div>

                <div className="input-container">
                    <div className="chat-input-wrapper">
                        <input type="text" className="user-input" placeholder="Enter a prompt here..." />
                    </div>
                    <p className="disclaimer">
                        AI may display inaccurate info, so double-check its responses.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default App;