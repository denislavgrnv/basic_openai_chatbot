import ChatHistoryEachTitle from "./ChatHistoryEachTitle";

export default function ChatHistorySideBar({ onSelectConversation, onNewChat }) {
    return (
        <aside className="sidebar">
            <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>
            <div className="history-label">Recent</div>

            <ChatHistoryEachTitle onSelect={onSelectConversation} />
        </aside>
    );
}