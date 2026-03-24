import { useState, useEffect } from 'react';
import './SettingsPage.css';

export default function SettingsPage({ user, onClose, onUpdate }) {
    const [status, setStatus] = useState("");
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                currentPassword: '',
                newPassword: ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("saving");

        const success = await onUpdate(formData);

        if (success) {
            setStatus("success");
            setTimeout(() => setStatus(""), 3000);
        } else {
            setStatus("");
        }
    };

    return (
        <div className="settings-overlay">
            <div className="settings-card">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="close-icon-btn" onClick={onClose}>×</button>
                </div>

                <form className="settings-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled // Usually email is locked or requires verification
                        />
                        <small>Email cannot be changed directly.</small>
                    </div>

                    <hr className="settings-divider" />

                    <div className="input-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            placeholder="••••••••"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Leave blank to keep current"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="settings-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}