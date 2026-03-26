import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, CircleCheckBig } from 'lucide-react';
import { authApi } from '../lib/api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (!credentials.email?.trim() || !credentials.password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            const payload = { email: credentials.email.trim(), password: credentials.password };
            const response = await authApi.post('/login', payload);
            const data = response?.data || {};
            const user = data.user || {};

            const token = data.accessToken || data.token;
            const role = user.role || data.role;
            const userId = user.id ?? data.userId;
            const email = user.email || data.email || credentials.email;
            const name =
                data.name ||
                user.username ||
                [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                (typeof email === 'string' && email.includes('@') ? email.split('@')[0] : '');

            if (!token) {
                throw new Error('Login response missing access token');
            }

            localStorage.setItem('auth_token', token);
            if (role) localStorage.setItem('user_role', role);
            if (email) localStorage.setItem('user_email', email);
            if (userId !== undefined && userId !== null) localStorage.setItem('user_id', String(userId));
            if (name) localStorage.setItem('user_name', name);

            if (role === 'ADMIN') {
                router.push('/dashboard/admin');
            } else if (role === 'DOCTOR') {
                // Check if doctor has completed profile setup
                try {
                    const { doctorApi } = await import('../lib/api');
                    const profileRes = await doctorApi.get('/profile/me');
                    // Profile exists, go to dashboard
                    router.push('/doctor/dashboard');
                } catch (profileErr) {
                    // Profile doesn't exist (404), redirect to setup
                    if (profileErr.response?.status === 404) {
                        router.push('/doctor/profile/setup');
                    } else {
                        // Other error, go to dashboard anyway
                        router.push('/doctor/dashboard');
                    }
                }
            } else {
                router.push('/dashboard/patient');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-[var(--color-text)] bg-[var(--color-bg)]">
            <div className="section-shell py-8 md:py-12">
                <div className="grid min-h-[78vh] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-strong)] lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative bg-gradient-to-b from-[#145ec2] to-[#0f4fa9] p-8 md:p-10 text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(800px_300px_at_10%_0%,rgba(255,255,255,0.18),transparent)]" />
                        <div className="relative flex h-full flex-col justify-between">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/logo.png" alt="SynapseCare" className="w-10 h-10" />
                                <span className="text-2xl font-semibold">SynapseCare</span>
                            </Link>

                            <div>
                                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">Welcome back to your clinical portal.</h1>
                                <p className="mt-4 text-blue-100 max-w-sm">
                                    Securely manage appointments, records, and consultations in one trusted healthcare workspace.
                                </p>

                                <div className="mt-8 space-y-3">
                                    {['Protected patient data', 'Fast role-based access', 'Always-on support workflows'].map((item) => (
                                        <div key={item} className="flex items-center gap-2 text-sm text-blue-50">
                                            <CircleCheckBig className="w-4 h-4" /> {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-blue-100/90">Clinical access console • v3</p>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 lg:p-12 flex items-center">
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md mx-auto">
                            <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
                            <p className="copy-muted mt-2 text-sm">Enter your credentials to continue.</p>

                            {error && (
                                <div className="mt-5 rounded-[var(--radius-sm)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="mt-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                        <input
                                            type="email"
                                            placeholder="name@hospital.com"
                                            value={credentials.email}
                                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all"
                                            onChange={(e)=>setCredentials({...credentials, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Password</label>
                                        <button type="button" className="text-xs font-semibold text-[var(--color-primary)]">Forgot Password?</button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={credentials.password}
                                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all"
                                            onChange={(e)=>setCredentials({...credentials, password: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-semibold text-sm shadow-[var(--shadow-soft)] transition-all flex items-center justify-center gap-2 hover:bg-[var(--color-primary-strong)] disabled:opacity-50"
                                >
                                    {loading ? 'Signing In...' : <>Continue <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-sm copy-muted">
                                New to SynapseCare? <Link href="/register" className="text-[var(--color-primary)] font-semibold">Create an account</Link>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
