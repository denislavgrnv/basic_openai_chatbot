import ChatHistoryEachTitle from "./ChatHistoryEachTitle";

export default function ChatHistorySideBar({ onSelectConversation, onNewChat, refreshTrigger, isGuest }) {
    return (
        <aside className="sidebar">
            <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>

            {!isGuest ? (
                <>
                    <div className="history-label">Recent</div>
                    <ChatHistoryEachTitle
                        onSelect={onSelectConversation}
                        refreshTrigger={refreshTrigger}
                    />
                </>
            ) : (
                <div className="guest-sidebar-empty">
                    <p>History is disabled in Guest Mode.</p>
                </div>
            )}
        </aside>
    );
}