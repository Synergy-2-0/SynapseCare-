import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Heart, Shield, ArrowRight, Activity, Stethoscope } from 'lucide-react';

const RegisterPage = () => {
    const [role, setRole] = useState('PATIENT');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', extra: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            alert(`Registered successfully as ${role}! Redirecting to login...`);
            router.push('/login');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-bold italic">
            <div className="md:w-1/3 bg-slate-900 border-r border-slate-800 p-12 text-white flex flex-col justify-between relative overflow-hidden italic">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <Link href="/" className="flex items-center gap-2 relative z-10 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">S</div>
                    <span className="text-2xl font-black tracking-tight italic">SynapseCare</span>
                </Link>
                <div className="relative z-10 space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black leading-tight italic">Start your journey to <span className="text-primary">Better Health</span>.</h1>
                        <p className="text-slate-400 font-medium leading-relaxed italic">Join over 10,000+ users who trust our cloud-native healthcare platform for their medical needs.</p>
                    </div>
                </div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 relative z-10 italic">© 2026 Virtual Health Systems</div>
            </div>

            <div className="flex-1 p-8 md:p-24 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl space-y-10 font-bold italic">
                    <div className="space-y-2 italic italic italic">
                        <h2 className="text-4xl font-black text-slate-900 italic">Create Account</h2>
                        <p className="text-slate-500 font-bold italic italic">Select your role to get started with SynapseCare.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 italic italic">
                        <button onClick={() => setRole('PATIENT')} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-3 items-center text-center group ${role === 'PATIENT' ? 'border-primary bg-orange-50/50 shadow-xl shadow-orange-500/5' : 'border-slate-100 hover:border-slate-200'}`}>
                            <User className={`w-8 h-8 transition-colors ${role === 'PATIENT' ? 'text-primary' : 'text-slate-300'}`} />
                            <div><div className="font-black text-slate-900 group-hover:text-primary transition-colors italic">Patient</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">Personal Access</div></div>
                        </button>
                        <button onClick={() => setRole('DOCTOR')} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-3 items-center text-center group ${role === 'DOCTOR' ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-500/5' : 'border-slate-100 hover:border-slate-200'}`}>
                            <Stethoscope className={`w-8 h-8 transition-colors ${role === 'DOCTOR' ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <div><div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors italic">Doctor</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">Provider Access</div></div>
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6 italic italic italic">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 italic italic italic">
                            <div className="space-y-2 italic font-bold">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 italic italic italic">Full Name</label>
                                <div className="relative italic font-bold">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input type="text" placeholder="John Carter" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/50 transition-all italic shadow-inner" required />
                                </div>
                            </div>
                            <div className="space-y-2 italic font-bold">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 italic italic italic">Email Address</label>
                                <div className="relative italic font-bold font-bold">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input type="email" placeholder="john@example.com" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary/50 transition-all italic shadow-inner" required />
                                </div>
                            </div>
                        </div>
                        <button disabled={loading} className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 italic ${role === 'PATIENT' ? 'bg-primary text-white shadow-orange-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                            {loading ? "Initializing..." : (<>Create {role.toLowerCase()} Profile <ArrowRight className="w-5 h-5" /></>)}
                        </button>
                    </form>
                    <p className="text-center font-bold text-slate-400 italic">Already have an account? <Link href="/login" className="text-slate-900 hover:underline italic">Sign In Now</Link></p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
