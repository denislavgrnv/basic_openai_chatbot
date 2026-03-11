import ChatHistoryEachTitle from "./ChatHistoryEachTitle";
export default function ChatHistorySideBar() {
    return (
        <aside className="sidebar">
            <button className="new-chat-btn">+ New Chat</button>

            <div className="history-label">Recent</div>

            <ChatHistoryEachTitle />
        </aside>
    );
}