import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi } from '../lib/api';

const ResetPasswordPage = () => {
    const router = useRouter();
    const { token } = router.query;
    
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (router.isReady && !token) {
            setError('Invalid or missing recovery token. Please request a new one.');
        }
    }, [router.isReady, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Security strings do not match. Please verify your entries.');
            return;
        }

        setLoading(true);
        try {
            await authApi.post('/reset-password', { 
                token, 
                newPassword: passwords.newPassword 
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Security reset failed. The token may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Finalize Reset | SynapsCare Security</title>
                <meta name="description" content="Set your new secure clinical credentials" />
            </Head>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent_500px)] pointer-events-none" />
                
                <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-200/50 relative z-10">
                    {/* Left Side: Security Confirmation */}
                    <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                        
                        <Link href="/" className="flex items-center gap-3 relative z-10 transition-transform hover:scale-105 active:scale-95 w-fit">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 brightness-200" />
                            <span className="text-2xl font-black tracking-tighter">Synapse<span className="text-indigo-400">Care</span></span>
                        </Link>

                        <div className="relative z-10 space-y-8">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-black leading-tight tracking-tight text-white"
                            >
                                Security <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">Finalization Suite.</span>
                            </motion.h1>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
                                You are now securely modifying your clinical access identity. 🛡️
                            </p>
                            
                            <div className="space-y-4 pt-4">
                                {['Secure Token Validation', 'Double-Encryption Sync', 'Instant Dashboard Re-entry'].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300 tracking-wide">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        </div>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 pt-10 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            SynapsCare Identity v4.0 | Identity Portal
                        </div>
                    </div>

                    {/* Right Side: Reset Form */}
                    <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {!success ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full"
                                >
                                    <div className="mb-12">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-sm border border-indigo-100">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Set Security Key</h2>
                                        <p className="font-medium text-slate-500">Please enter your new 256-bit encrypted security string.</p>
                                    </div>

                                    {error && (
                                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">!</div>
                                            {error}
                                        </div>
                                    )}

                                    {!token && !error ? (
                                         <div className="flex justify-center p-8 text-indigo-600">
                                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                                         </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">New Security String</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••••••"
                                                        value={passwords.newPassword}
                                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                                        className="input-field pl-12"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Confirm Identity Key</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••••••"
                                                        value={passwords.confirmPassword}
                                                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                                        className="input-field pl-12"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                disabled={loading || !token}
                                                className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base font-bold group"
                                            >
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Finalize Security Reset
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-200">
                                        <CheckCircle2 size={48} strokeWidth={3} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Security Updated</h2>
                                    <p className="font-medium text-slate-500 mb-10 leading-relaxed max-w-sm mx-auto">
                                        Your recovery is complete. Your new clinical credentials are now active on the system.
                                    </p>
                                    <Link href="/login" className="btn-primary py-4 px-10 inline-block font-bold">
                                        Return to Login Securely
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;
