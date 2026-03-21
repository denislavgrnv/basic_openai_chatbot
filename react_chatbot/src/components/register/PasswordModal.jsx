import React, { useState } from 'react';
import './PasswordModal.css';

export default function PasswordModal({ isOpen, onClose, onSave }) {
    const [password, setPassword] = useState("");
    const [rePass, setRePass] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null; // Don't render if not open

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== rePass) {
            setError("Passwords do not match!");
            return;
        }

        onSave(password);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h2>Update Password</h2>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <p className="modal-error">{error}</p>}

                    <div className="modal-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="modal-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={rePass}
                            onChange={(e) => setRePass(e.target.value)}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">Save Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}