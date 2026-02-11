import { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface SiteGateProps {
    children: ReactNode;
}

export default function SiteGate({ children }: SiteGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('site_access_token');
        if (token === 'granted') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('/auth/site-access', { password });
            sessionStorage.setItem('site_access_token', 'granted');
            setIsAuthenticated(true);
        } catch (err) {
            setError('Incorrect password');
        }
    };

    if (isLoading) return null;

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-bt-magenta to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 px-6 py-3">
                        <span className="text-white font-bold text-xl">BT Store Locator</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome</h2>
                <p className="text-center text-gray-500 mb-8">Please enter the access password to continue.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bt-magenta focus:border-transparent outline-none transition-all text-center tracking-widest text-lg"
                            placeholder="Enter Password"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-bt-magenta text-white py-3 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg transform active:scale-[0.98]"
                    >
                        Enter
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <span className="text-xs font-medium text-gray-300">Protected Area &copy; KG273</span>
                </div>
            </div>
        </div>
    );
}
