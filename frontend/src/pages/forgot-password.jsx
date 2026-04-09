import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../lib/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await authApi.post('/forgot-password', { email: email.trim() });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send recovery email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Password Recovery | SynapsCare Security</title>
                <meta name="description" content="Securely recover your clinical account credentials" />
            </Head>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent_500px)] pointer-events-none" />
                
                <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-200/50 relative z-10">
                    {/* Left Side: Security Info */}
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
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">Identity Recovery.</span>
                            </motion.h1>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
                                To protect your clinical data, we use an encrypted token-based recovery system. 
                            </p>
                            
                            <div className="space-y-4 pt-4">
                                {['256-bit Encrypted Tokens', '24-hour Auto-Expiry', 'One-Click Secure Portal'].map((text, i) => (
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
                            SynapsCare Identity v4.0 | SOC2 Compliant
                        </div>
                    </div>

                    {/* Right Side: Recovery Form */}
                    <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {!success ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full"
                                >
                                    <Link href="/login" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8 hover:translate-x-[-4px] transition-transform">
                                        <ArrowLeft size={16} /> Back to Login
                                    </Link>
                                    
                                    <div className="mb-12">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Forgot Security Key?</h2>
                                        <p className="font-medium text-slate-500">Enter your clinical email and we&apos;ll dispatch a secure recovery link.</p>
                                    </div>

                                    {error && (
                                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">!</div>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email Terminal</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    placeholder="user@synapsecare.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
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
                                                    Dispatch Recovery Email
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <CheckCircle2 size={48} strokeWidth={3} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Email Dispatched</h2>
                                    <p className="font-medium text-slate-500 mb-10 leading-relaxed max-w-sm mx-auto">
                                        Check your inbox at <strong>{email}</strong> for instructions to finalize your security reset.
                                    </p>
                                    <Link href="/login" className="btn-primary py-4 px-10 inline-block font-bold">
                                        Return to Secure Portal
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

export default ForgotPasswordPage;
