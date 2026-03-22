import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Activity, 
    Shield, 
    Stethoscope, 
    Video, 
    MessageSquare, 
    Calendar, 
    ArrowRight, 
    Heart, 
    Search, 
    LayoutDashboard,
    CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-bold italic text-slate-800 selection:bg-indigo-100 italic font-bold">
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-50 px-8 py-6 flex justify-between items-center italic">
                <div className="flex items-center gap-3 italic">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-indigo-50 italic">S</div>
                    <span className="text-2xl font-black text-slate-900 italic tracking-tight">SynapseCare</span>
                </div>
                <div className="hidden md:flex gap-12 font-black text-xs uppercase tracking-widest text-slate-500 italic">
                    {['Specialists', 'Services', 'Pricing', 'Contact'].map((item) => (
                        <a key={item} href="#" className="hover:text-indigo-600 transition-colors cursor-pointer italic">{item}</a>
                    ))}
                </div>
                <div className="flex gap-4 italic">
                    <Link href="/login" className="px-8 py-3 text-slate-900 border-2 border-slate-200 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all italic">Sign In</Link>
                    <Link href="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all italic">Get Started</Link>
                </div>
            </nav>

            <main className="pt-32 p-12 italic font-bold">
                <div className="max-w-7xl mx-auto italic font-bold">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32 italic">
                        <div className="space-y-10 italic">
                             <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black italic animate-bounce-slow">
                                <Shield className="w-4 h-4 italic" /> TRUSTED BY 10,000+ PATIENTS
                             </div>
                             <h1 className="text-8xl font-black text-slate-900 leading-[1.05] tracking-tighter italic">
                                Healthcare <br /> <span className="text-indigo-600 italic">Simplified.</span>
                             </h1>
                             <p className="text-xl text-slate-600 font-bold leading-relaxed max-w-xl italic opacity-90">
                                Experience world-class healthcare with AI diagnostics, easy appointment booking, and premium video consultations in one secure platform.
                             </p>
                             <div className="flex gap-6 py-8 italic font-bold">
                                <Link href="/chat" className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-600/30 flex items-center gap-3 hover:translate-y-[-4px] transition-all italic">
                                    <MessageSquare className="w-6 h-6 italic" /> Check Symptoms Now
                                </Link>
                                <div className="flex items-center gap-4 italic">
                                    <div className="flex -space-x-4 italic">
                                        {[1,2,3].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 italic overflow-hidden shadow-md"></div>)}
                                    </div>
                                    <div className="text-xs font-black text-slate-400 uppercase italic">Board Certified Doctors</div>
                                </div>
                             </div>
                        </div>

                        <div className="relative group italic font-bold">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-white border border-slate-200 p-12 rounded-[4rem] shadow-2xl transform hover:rotate-2 transition-transform italic">
                                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 italic">
                                    <Activity className="w-10 h-10 italic" />
                                 </div>
                                 <h3 className="text-4xl font-black text-slate-900 mb-6 italic italic font-bold tracking-tight">Smart Health Management</h3>
                                 <p className="text-slate-500 text-lg font-bold leading-relaxed italic mb-8">Access all your medical services, appointments, and results in one secure, unified dashboard.</p>
                                 <div className="space-y-4 italic font-bold">
                                    {['Secure Health Vault', 'Real-time Health Sync', 'Certified Specialists'].map(f => (
                                        <div key={f} className="flex items-center gap-3 text-sm font-black text-slate-900 italic">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-600 italic" /> {f}
                                        </div>
                                    ))}
                                 </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32 italic font-bold">
                        {[
                            { icon: Stethoscope, label: 'Find a Specialist', desc: 'Connect with experienced doctors in your city quickly.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { icon: Calendar, label: 'Easy Booking', desc: 'Schedule appointments in seconds with any provider.', color: 'text-rose-600', bg: 'bg-rose-50' },
                            { icon: Video, label: 'Video Consultations', desc: 'Private, secure video calls with your doctors anywhere.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { icon: Activity, label: 'AI Health Core', desc: 'Instant symptom guidance from our advanced medical library.', color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map((feat, i) => (
                            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group italic font-bold">
                                <div className={`w-16 h-16 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform italic`}>
                                    <feat.icon className="w-8 h-8 italic" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-4 italic italic font-bold tracking-tight">{feat.label}</h4>
                                <p className="text-slate-500 text-sm font-bold leading-relaxed italic opacity-80">{feat.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-[5rem] p-24 relative overflow-hidden italic font-bold">
                         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                         <div className="relative z-10 max-w-3xl space-y-8 italic font-bold">
                            <h3 className="text-6xl font-black text-white leading-tight italic tracking-tighter">Ready to manage your <br /> health better?</h3>
                            <p className="text-slate-400 text-xl font-bold italic opacity-80 leading-relaxed italic font-bold uppercase tracking-[0.05em] text-indigo-400">Join Thousands of Healthy Patients Today</p>
                            <Link href="/register" className="inline-flex px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-600/40 items-center gap-4 hover:bg-indigo-500 transition-all italic">
                                Sign Up Now <ArrowRight className="w-6 h-6 italic" />
                            </Link>
                         </div>
                    </div>
                </div>
            </main>

            <footer className="p-12 border-t border-slate-200 bg-white italic font-bold">
                 <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 italic font-bold">
                    <div className="flex items-center gap-3 italic">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm italic">S</div>
                        <span className="text-lg font-black text-slate-900 italic tracking-tight italic font-bold">SynapseCare Portal</span>
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest italic italic font-bold">© 2026 SynapseCare Digital Health</div>
                    <div className="flex gap-8 text-[10px] font-black uppercase text-slate-500 tracking-wider italic italic font-bold">
                        <a href="#" className="hover:text-indigo-600 italic">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-600 italic">Terms of Service</a>
                        <a href="#" className="hover:text-indigo-600 italic">Doctor Network</a>
                    </div>
                 </div>
            </footer>
        </div>
    );
};

export default LandingPage;
