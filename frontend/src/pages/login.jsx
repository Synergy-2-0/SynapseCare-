import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, LayoutDashboard } from 'lucide-react';
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
        
        try {
            const payload = { email: credentials.email.trim(), password: credentials.password };
            const response = await authApi.post('/login', payload);
            const data = response?.data || {};
            const user = data.user || {};

            const token = data.accessToken || data.token;
            const role = user.role || data.role;
            const userId = user.id ?? data.userId;
            const email = user.email || data.email || credentials.email;
            const name = data.name || user.username || 'User';

            if (!token) throw new Error('Authentication failed');

            localStorage.setItem('auth_token', token);
            if (role) localStorage.setItem('user_role', role);
            if (email) localStorage.setItem('user_email', email);
            if (userId !== undefined && userId !== null) localStorage.setItem('user_id', String(userId));
            if (name) localStorage.setItem('user_name', name);

            // Role based routing
            if (role === 'ADMIN') router.push('/dashboard/admin');
            else if (role === 'DOCTOR') router.push('/dashboard/doctor');
            else router.push('/dashboard/patient');

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent_500px)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.05),transparent_500px)] pointer-events-none" />

            <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-200/50 relative z-10">
                {/* Left Side: Branding & Info */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                    
                    <Link href="/" className="flex items-center gap-3 relative z-10 transition-transform hover:scale-105 active:scale-95 w-fit">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 brightness-200" />
                        <span className="text-2xl font-black tracking-tighter">Synapse<span className="text-indigo-400">Care</span></span>
                    </Link>

                    <div className="relative z-10 space-y-8">
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
                            Secure Access to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">Clinical Intelligence.</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
                            Manage your healthcare journey with a platform designed for clinical precision and patient trust.
                        </p>
                        
                        <div className="space-y-4 pt-4">
                            {[
                                'Universal Medical History Vault',
                                'Real-time Telemedicine Bridge',
                                'Encrypted Health Records'
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300 tracking-wide">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                        <CheckCircle2 size={12} strokeWidth={3} />
                                    </div>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <span>Healthcare Console v4.0</span>
                        <span>SOC2 Compliance</span>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <div className="mb-12">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Welcome Back</h2>
                            <p className="copy-description font-medium">Please enter your clinical credentials to continue.</p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">!</div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email Terminal</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="user@synapsecare.com"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                        className="input-field pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Security Key</label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 hover:text-indigo-700">Forgot?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                        className="input-field pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base font-bold group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Continue to Dashboard
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-slate-500 font-bold text-sm">
                                New to the ecosystem? <br className="sm:hidden" />
                                <Link href="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors ml-1 uppercase tracking-wider text-xs">Create Clinical Identity</Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
