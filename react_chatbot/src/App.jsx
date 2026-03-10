import './chatbot.css'

function App() {
    return (
        <div className="app-layout"> {/* The 'Father' wrapper */}
            <aside className="sidebar">
                <button className="new-chat-btn">+ New Chat</button>
                <div className="history-label">Recent</div>
                <div className="history-item">How to center a div</div>
                <div className="history-item">JavaScript API Tutorial</div>
                <div className="history-item">Project Ideas 2026</div>
            </aside>

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