import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Search, Heart, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Mock login
        setTimeout(() => {
            const role = credentials.email.includes('admin') ? 'ADMIN' : (credentials.email.includes('doctor') ? 'DOCTOR' : 'PATIENT');
            localStorage.setItem('user_role', role);
            localStorage.setItem('user_name', credentials.email.split('@')[0]);
            localStorage.setItem('user_id', '1001');
            
            if (role === 'ADMIN') router.push('/dashboard/admin');
            else if (role === 'DOCTOR') router.push('/dashboard/doctor');
            else router.push('/dashboard/patient');
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-bold italic">
            <div className="md:w-1/3 bg-slate-900 border-r border-slate-800 p-12 text-white flex flex-col justify-between relative overflow-hidden italic">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <Link href="/" className="flex items-center gap-2 relative z-10 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-primary/20 transition-transform group-hover:scale-110">S</div>
                    <span className="text-2xl font-black italic tracking-tight">SynapseCare</span>
                </Link>
                <div className="relative z-10">
                    <h1 className="text-5xl font-black italic leading-tight mb-8">Access Your <span className="text-primary tracking-tighter">Clinical Hub</span>.</h1>
                    <p className="text-slate-400 font-bold italic leading-relaxed opacity-80 mb-12">Connect securely with your personalized medical ecosystem across our distributed node infrastructure.</p>
                    <div className="space-y-6">
                        {[
                            { icon: Shield, title: "Vault-Grade Privacy", desc: "Military-grade encryption for PHI data." },
                            { icon: Heart, title: "Patient-First Flow", desc: "Designed for clinical precision and empathy." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="p-3 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0"><item.icon className="w-5 h-5 text-primary" /></div>
                                <div><h4 className="font-bold text-sm italic">{item.title}</h4><p className="text-slate-500 text-xs mt-1 font-bold italic">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 relative z-10 italic">Distributed Node #7C2A-00FF</div>
            </div>

            <div className="flex-1 p-8 md:p-24 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl space-y-12">
                    <div className="space-y-2 italic font-bold">
                        <h2 className="text-5xl font-black text-slate-900 italic">Welcome Back</h2>
                        <p className="text-slate-500 font-bold italic text-lg opacity-80 italic">Enter your credentials to access our healthcare network.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8 italic font-bold">
                        <div className="space-y-3 italic">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic italic italic">Network Identity (Email)</label>
                            <div className="relative italic italic">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input 
                                    type="email" 
                                    placeholder="patient-001@synapse.care"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] py-6 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all italic shadow-inner"
                                    onChange={(e)=>setCredentials({...credentials, email: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-3 italic font-bold">
                            <div className="flex justify-between items-center px-1 italic italic italic">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic italic italic">Secret Key (Password)</label>
                                <button type="button" className="text-[10px] font-black uppercase text-primary italic italic italic">Reset Key</button>
                            </div>
                            <div className="relative italic font-bold">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] py-6 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all italic shadow-inner"
                                    onChange={(e)=>setCredentials({...credentials, password: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/40 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 hover:bg-slate-800 italic"
                        >
                            {loading ? "Authenticating Session..." : (
                                <>Access Terminal <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center font-black text-slate-400 text-sm italic italic tracking-tight">New to our network? <Link href="/register" className="text-slate-900 hover:underline italic italic">Initialize Profile Access</Link></p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
