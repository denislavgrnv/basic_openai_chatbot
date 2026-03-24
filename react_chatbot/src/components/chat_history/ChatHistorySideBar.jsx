import { useState } from "react";

import ChatHistoryEachTitle from "./ChatHistoryEachTitle";
import SettingsPage from "../settings/SettingsPage";

export default function ChatHistorySideBar({
    onSelectConversation,
    onNewChat,
    refreshTrigger,
    isGuest,
    user,
    onUpdateUser
}) {
    const [showSettings, setShowSettings] = useState(false);

    // This stays here to handle the UI logic
    const handleUserUpdate = async (formData) => {
        await onUpdateUser(formData);
    };
    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <button className="new-chat-btn" onClick={onNewChat}>
                    <span className="plus-icon">+</span> New Chat
                </button>

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
            </div>

            {!isGuest && (
                <div className="sidebar-footer">
                    <button className="settings-btn" onClick={() => setShowSettings(true)}>
                        ⚙ Settings
                    </button>
                </div>
            )}

            {showSettings && (
                <SettingsPage
                    user={user}
                    onClose={() => setShowSettings(false)}
                    onUpdate={handleUserUpdate}
                />
            )}
        </aside>
    );
}