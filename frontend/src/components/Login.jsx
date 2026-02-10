import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // ✅ CRITICAL

        try {
            await login(email, password); // ✅ USE CONTEXT
            navigate('/instructor/availability')
        } catch (err) {
            console.error(err);
            setError('Invalid email or password');
        }
    };

    return (
        <form onSubmit={handleLogin} className="p-6 space-y-4">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border p-2 w-full"
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border p-2 w-full"
                required
            />

            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Login
            </button>

            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}