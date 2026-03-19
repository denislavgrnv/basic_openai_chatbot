import { useState } from 'react';
import api from '../../../api/requester.js';
import './LoginPage.css';

// 1. Add switchToRegister to the props here
export default function LoginPage({ onLoginSuccess, switchToRegister, onGuestContinue }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.post('http://localhost:5000/api/auth/login', {
                email: email,
                password: password
            });

            if (response.user) {
                onLoginSuccess(response.user);
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                </div>

                {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="auth-btn">Log In</button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <span onClick={switchToRegister}>Sign Up</span></p>

                    <div className="guest-separator">or</div>
                    <button
                        type="button"
                        className="guest-link-btn"
                        onClick={onGuestContinue}
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
}