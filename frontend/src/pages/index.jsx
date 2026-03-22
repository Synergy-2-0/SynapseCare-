import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Brain, Calendar, Video, Activity, Users } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <nav className="fixed top-0 w-full z-50 glass shadow-sm px-8 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-primary/20">S</div>
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">SynapseCare</span>
                </div>
                <div className="flex gap-8 items-center text-sm font-bold italic">
                    <Link href="#features" className="hover:text-primary transition-colors italic">Features</Link>
                    <Link href="#about" className="hover:text-primary transition-colors italic">About Us</Link>
                    <Link href="/login" className="px-5 py-2 hover:text-primary transition-colors italic">Login</Link>
                    <Link href="/register" className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-orange-600 transition-all shadow-md active:scale-95 italic">Get Started</Link>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-primary text-sm font-bold border border-orange-200 uppercase tracking-widest italic animate-bounce shadow-inner">
                            <Shield className="w-4 h-4" /> Trusted by 10k+ Patients
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black leading-tight italic">
                            Future of <span className="text-primary tracking-tighter">Health</span> is Synchronized
                        </h1>
                        <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-bold italic opacity-80">Experience clinical precision with AI-driven diagnostics, seamless scheduling, and premium virtual consultations.</p>
                        <div className="flex gap-4 pt-4">
                            <Link href="/register" className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 italic">
                                Register Now <Users className="w-5 h-5" />
                            </Link>
                            <Link href="/chat" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2 italic">
                                <Brain className="w-5 h-5" /> AI Hub
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 relative">
                        <div className="w-full aspect-square bg-gradient-to-tr from-primary to-orange-300 rounded-[4rem] shadow-2xl overflow-hidden relative rotate-3 group transition-transform">
                            <div className="absolute inset-4 bg-white rounded-[3rem] flex items-center justify-center border-4 border-dashed border-primary/20 p-10 text-center space-y-4">
                                <div>
                                    <Activity className="w-20 h-20 text-primary mx-auto animate-pulse mb-6" />
                                    <h3 className="text-3xl font-black text-slate-900 italic">Multi-Service Cloud</h3>
                                    <p className="text-slate-400 font-bold italic mt-4 italic">Integrated patient management across all microservices endpoints.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-slate-900 py-16 text-white italic">
                <div className="max-w-7xl mx-auto px-8 flex justify-around flex-wrap gap-12 text-center italic tracking-[0.3em] text-[10px] font-black uppercase opacity-60">
                   {["Personalized Care","Expert Monitoring","Military-Grade Security","Zero-Latency Connect"].map((t,i)=>(
                    <div key={i} className="flex flex-col gap-4 items-center">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {t}
                    </div>
                   ))}
                </div>
            </section>

            <section id="features" className="py-24 px-8 bg-slate-50 italic">
                <div className="max-w-7xl mx-auto italic font-bold">
                    <div className="text-center mb-16 italic font-bold">
                        <h2 className="text-5xl font-black italic">Platform Capabilities</h2>
                        <div className="w-24 h-2 bg-primary mx-auto rounded-full mt-6"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 italic font-bold font-bold">
                        {[
                            { icon: Shield, title: "Universal Records", desc: "Access your centralized medical history across all service nodes." },
                            { icon: Calendar, title: "Real-time Scheduling", desc: "Instant booking confirmation via our appointment-service hub." },
                            { icon: Video, title: "Tele-Health Engine", desc: "Secure video consultations with peer-to-peer clinical precision." },
                            { icon: Activity, title: "Vitals Analytics", desc: "Monitor bio-signals via our integration-service dashboard." },
                            { icon: Brain, title: "Symptom Logic", desc: "Advanced AI-driven symptom analysis with specialist matching." },
                            { icon: Users, title: "Provider Network", desc: "Direct access to our verified global directory of medical specialists." }
                        ].map((f, i) => (
                            <motion.div key={i} whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all italic">
                                <f.icon className="w-14 h-14 text-primary mb-8 animate-pulse" />
                                <h3 className="text-2xl font-black mb-4 italic italic">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-bold italic italic">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t text-center text-slate-300 text-[10px] uppercase font-black italic tracking-widest italic font-bold italic">
                © 2026 SynapseCare Operations - Distributed via Kubernetes Node Clusters
            </footer>
        </div>
    );
}

export default LandingPage;
