import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, Heart, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { patientApi } from '../lib/api';

const RegisterPage = () => {
    const [role, setRole] = useState('PATIENT');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role === 'PATIENT') {
                await patientApi.post('/patients', {
                    name: formData.name,
                    email: formData.email,
                    address: formData.address
                });
            }
            router.push('/login');
            setLoading(false);
        } catch (err) {
            console.error("Registration failed", err);
            alert("Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-bold italic text-slate-900 italic font-bold">
            <div className="md:w-[500px] bg-slate-950 p-20 text-white flex flex-col justify-between relative overflow-hidden italic font-bold">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                
                <Link href="/" className="flex items-center gap-3 relative z-10 group italic">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-all group-hover:scale-110 italic">S</div>
                    <span className="text-2xl font-black italic tracking-tighter italic font-bold">SynapseCare</span>
                </Link>

                <div className="relative z-10 space-y-12 italic font-bold">
                    <h1 className="text-6xl font-black italic italic leading-[1.05] tracking-tighter italic">Create Your <span className="text-indigo-400 italic">Health</span> Account.</h1>
                    <div className="space-y-6 italic font-bold">
                        {["Secure Cloud Storage", "Private Data Encryption", "Direct Doctor Connect"].map(f => (
                            <div key={f} className="flex items-center gap-4 text-slate-400 text-lg font-bold italic group">
                                <CheckCircle2 className="w-6 h-6 text-indigo-400 italic group-hover:scale-110" /> {f}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-700 relative z-10 italic">Account Registration v1.2</div>
            </div>

            <div className="flex-1 bg-[#F8FAFC] p-8 md:p-24 flex items-center justify-center italic font-bold overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl space-y-12 italic font-bold">
                    <div className="space-y-4 italic font-bold text-center md:text-left">
                        <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter">Sign Up</h2>
                        <p className="text-slate-500 font-bold italic text-lg opacity-90 italic">Select your role and enter your details to get started.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 italic font-bold">
                        {[{ id: 'PATIENT', label: 'I am a Patient', desc: 'Secure health portal' }, { id: 'DOCTOR', label: 'I am a Doctor', desc: 'Clinical specialist access' }].map((r) => (
                            <button key={r.id} onClick={() => setRole(r.id)} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left italic font-bold shadow-xl ${role === r.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/30' : 'bg-white border-slate-100 text-slate-900 hover:border-slate-200'}`}>
                                <div className="font-black text-2xl italic mb-1">{r.label}</div>
                                <div className={`text-xs font-bold italic uppercase tracking-[0.1em] opacity-80 italic font-bold`}>{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8 italic font-bold">
                        <div className="space-y-4 italic font-bold">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Full Name</label>
                            <input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe" 
                                className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 px-10 text-sm font-black text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-md italic" required 
                            />
                        </div>
                        <div className="space-y-4 italic font-bold">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Email Address</label>
                            <input 
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                type="email" placeholder="john@gmail.com" 
                                className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 px-10 text-sm font-black text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-md italic" required 
                            />
                        </div>
                        <div className="space-y-4 italic font-bold">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Password</label>
                            <input type="password" placeholder="••••••••••••" className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 px-10 text-sm font-black text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-md italic" required />
                        </div>
                        <div className="space-y-4 italic font-bold">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Personal Address</label>
                            <input 
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="City, State" 
                                className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 px-10 text-sm font-black text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-md italic" required 
                            />
                        </div>
                        
                        <div className="md:col-span-2 pt-6 italic font-bold">
                            <button disabled={loading} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all shadow-slate-900/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] italic">
                                {loading ? "Creating Account..." : <>Complete Sign Up <ChevronRight className="w-7 h-7 italic" /></>}
                            </button>
                        </div>
                    </form>

                    <p className="text-center font-black text-slate-400 text-sm italic italic tracking-tight italic font-bold uppercase tracking-widest">Already have an account? <Link href="/login" className="text-slate-900 hover:text-indigo-600 italic italic font-bold underline underline-offset-8">Sign In</Link></p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
