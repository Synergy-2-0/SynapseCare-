import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
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
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-bold italic text-slate-900 italic font-bold">
            <div className="md:w-[450px] bg-slate-950 p-16 text-white flex flex-col justify-between relative overflow-hidden italic font-bold">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                
                <Link href="/" className="flex items-center gap-3 relative z-10 group italic">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl ring-4 ring-indigo-500/20 transition-transform group-hover:scale-110 italic">S</div>
                    <span className="text-3xl font-black italic tracking-tighter italic font-bold">SynapseCare</span>
                </Link>

                <div className="relative z-10 italic font-bold">
                    <h1 className="text-6xl font-black italic leading-[1.1] mb-8 italic tracking-tighter">Your <span className="text-indigo-400 italic">Personal</span> Health Dashboard.</h1>
                    <p className="text-slate-400 font-bold italic leading-relaxed opacity-80 mb-12 italic text-lg">Secure, encrypted access to your medical center, appointments, and test results.</p>
                    
                    <div className="space-y-8 italic font-bold">
                        {[
                            { title: "Privacy First", desc: "Your health data is safe and private." },
                            { title: "24/7 Access", desc: "Consult doctors and view records anytime." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start italic font-bold group hover:translate-x-2 transition-transform">
                                <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0 italic" />
                                <div><h4 className="font-black text-base italic">{item.title}</h4><p className="text-slate-500 text-sm mt-1 font-bold italic italic font-bold">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-600 relative z-10 italic font-bold">Secure Patient Portal v2.0</div>
            </div>

            <div className="flex-1 bg-[#F8FAFC] p-8 md:p-32 flex items-center justify-center italic font-bold">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl space-y-16 italic font-bold">
                    <div className="space-y-4 italic font-bold">
                        <h2 className="text-6xl font-black text-slate-900 italic tracking-tighter">Welcome Back</h2>
                        <p className="text-slate-500 font-bold italic text-xl opacity-90 italic">Please enter your sign-in details to access your portal.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-10 italic font-bold">
                        <div className="space-y-4 italic font-bold">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2 italic">Email Address</label>
                            <div className="relative italic font-bold">
                                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 italic" />
                                <input 
                                    type="email" 
                                    placeholder="your-name@gmail.com"
                                    className="w-full bg-white border-2 border-slate-200 rounded-[2.5rem] py-8 pl-18 pr-8 text-base font-black text-slate-900 outline-none focus:border-indigo-600 focus:ring-8 focus:ring-indigo-100 transition-all italic shadow-md shadow-slate-200/50"
                                    onChange={(e)=>setCredentials({...credentials, email: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-4 italic font-bold">
                            <div className="flex justify-between items-center px-4 italic font-bold">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Password</label>
                                <button type="button" className="text-xs font-black uppercase text-indigo-600 italic">Forgot Password?</button>
                            </div>
                            <div className="relative italic font-bold">
                                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 italic" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••••••"
                                    className="w-full bg-white border-2 border-slate-200 rounded-[2.5rem] py-8 pl-18 pr-8 text-base font-black text-slate-900 outline-none focus:border-indigo-600 focus:ring-8 focus:ring-indigo-100 transition-all italic shadow-md shadow-slate-200/50"
                                    onChange={(e)=>setCredentials({...credentials, password: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 hover:bg-indigo-700 italic"
                        >
                            {loading ? "Signing In..." : (
                                <>Sign In <ArrowRight className="w-6 h-6 italic" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center font-black text-slate-500 text-lg italic tracking-tight italic">New to SynapseCare? <Link href="/register" className="text-indigo-600 hover:underline italic font-bold">Create an Account</Link></p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
