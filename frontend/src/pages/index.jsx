import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Shield, Stethoscope, Video, MessageSquare, 
    Calendar, ArrowRight, Heart, Search, CheckCircle2, 
    Star, Smartphone, Download, Lock, Users, ChevronRight 
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100">
            {/* Elegant Header */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 sm:px-12 py-4 flex justify-between items-center ${
                scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'
            }`}>
                <div className="flex items-center gap-4 cursor-pointer">
                    <img src="/logo.png" alt="SynapseCare logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                    <span className="text-2xl font-black tracking-tight text-slate-800">SynapseCare</span>
                </div>
                
                <div className="hidden lg:flex gap-10 font-bold text-sm text-slate-500">
                    {['Specialists', 'Technology', 'Testimonials', 'About'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-teal-600 transition-colors">{item}</a>
                    ))}
                </div>

                <div className="flex gap-4">
                    <Link href="/login" className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-colors">Log In</Link>
                    <Link href="/register" className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-0.5 transition-all">Get Started</Link>
                </div>
            </nav>

            <main className="pt-32">
                {/* Hero Section */}
                <section className="px-6 sm:px-12 mb-32 max-w-7xl mx-auto">
                    <div className="bg-white rounded-[2rem] sm:rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 p-8 sm:p-16 gap-16 items-center">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8 relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-xs font-bold tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> Ranked #1 Global Provider
                                </div>
                                <h1 className="text-5xl sm:text-7xl font-black text-slate-800 leading-[1.1] tracking-tighter">
                                    Modern. <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Intelligent.</span> <br />
                                    Healthcare.
                                </h1>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                                    A seamless medical ecosystem for smarter diagnostics, faster appointments, and fully secure real-time care.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link href="/doctors" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-base shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all h-14">
                                        Find Specialist <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/chat" className="px-8 py-4 bg-teal-50 text-teal-700 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:bg-teal-100 transition-all h-14">
                                        <Activity className="w-5 h-5" /> Start Diagnosis
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-full w-full flex justify-center items-center">
                                {/* Vector Mock replaced with User Provided Image */}
                                <div className="relative w-full max-w-md aspect-square">
                                    <img src="/7075240_3531092.jpg" alt="Healthcare Vector" className="w-full h-full object-contain drop-shadow-2xl z-10 relative pointer-events-none" />
                                    
                                    {/* Soft aesthetic background blur */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300/30 rounded-full blur-[60px] -z-10"></div>
                                    <div className="absolute bottom-0 right-10 w-40 h-40 bg-emerald-300/30 rounded-full blur-[50px] -z-10"></div>
                                </div>

                                {/* Floating Micro UI */}
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute -left-4 sm:left-4 bottom-12 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
                                    <div>
                                        <div className="text-sm font-black text-slate-800">Clear Records</div>
                                        <div className="text-xs text-slate-500 font-medium">Updated 2m ago</div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Core Features */}
                <section className="px-6 sm:px-12 mb-32 max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">Miniaturized <span className="text-teal-600">Complexity</span></h2>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Powering thousands of clinics with simple, rounded, and breathable software design.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Telemedicine', desc: 'Latency-free secure 4K calls built directly into the portal.', icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { title: 'AI Symptom Checker', desc: 'Pre-consultation diagnosis using advanced mistral medical models.', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { title: 'Global Specialists', desc: 'Access 500+ top-tier doctors through an optimized booking flow.', icon: Stethoscope, color: 'text-teal-500', bg: 'bg-teal-50' },
                        ].map((feat, i) => (
                            <div key={i} className="bg-white p-8 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
                                <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feat.icon className={`w-6 h-6 ${feat.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{feat.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* App Showcase & Dual Vector Visuals */}
                <section className="px-6 sm:px-12 mb-32 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Visual Card 1 */}
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-[2rem] p-8 sm:p-12 overflow-hidden relative flex flex-col justify-between border border-teal-100 min-h-[400px]">
                            <div className="relative z-10 max-w-sm mb-8">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Patient-Centric Health Vault</h3>
                                <p className="text-slate-600 font-medium">All your prescriptions, lab results, and MRI scans in one unified interface.</p>
                            </div>
                            <img src="/8271001_5495.jpg" alt="Health Data Vector" className="w-[120%] h-auto absolute -bottom-10 -right-20 object-contain drop-shadow-xl" />
                        </div>

                        {/* Visual Card 2 */}
                        <div className="bg-gradient-to-bl from-slate-100 to-slate-50 rounded-[2rem] p-8 sm:p-12 overflow-hidden relative flex flex-col justify-between border border-slate-200 min-h-[400px]">
                            <div className="relative z-10 max-w-sm mb-8">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Real-time Care Handoff</h3>
                                <p className="text-slate-600 font-medium">Team dashboards for consistent patient updates and shared clinical action items.</p>
                            </div>
                            <img src="/7774236_3736765.jpg" alt="Collaboration Vector" className="w-[120%] h-auto absolute -bottom-20 -right-10 object-contain drop-shadow-xl" />
                        </div>
                    </div>
                </section>

                {/* Unified CTA */}
                <section className="px-6 sm:px-12 mb-32 max-w-7xl mx-auto">
                    <div className="bg-slate-900 rounded-[2rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">Health, unified.</h2>
                            <p className="text-xl text-slate-300 font-medium">Download the mobile app to sync your data or create a clinic account to begin managing patients.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:scale-105 transition-transform h-14">
                                    <Download className="w-5 h-5"/> Download iOS App
                                </button>
                                <button className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-base hover:bg-teal-500 transition-colors h-14">
                                    Continue on Web
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-slate-100 py-20 px-6 sm:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="SynapseCare logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-black text-slate-800 tracking-tight">SynapseCare</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
                            Whitish, clean, and highly secure digital healthcare infrastructure. Next generation patient management system.
                        </p>
                    </div>

                    {[
                        { title: 'Platform', links: ['Cloud Sync', 'AI Models', 'Telehealth', 'Vault Security'] },
                        { title: 'Resources', links: ['Find Doctors', 'Clinics Guide', 'Help Center', 'API Docs'] },
                        { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'HIPAA/SOC2', 'Cookie Preferences'] }
                    ].map((g, i) => (
                        <div key={i} className="space-y-6">
                            <h4 className="text-sm font-bold text-slate-800">{g.title}</h4>
                            <ul className="space-y-4">
                                {g.links.map(l => (
                                    <li key={l}><a href="#" className="text-slate-500 hover:text-teal-600 font-medium text-sm transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold text-slate-400">
                    <div>© 2026 SynapseCare Digital. All rights reserved.</div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-800 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-slate-800 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-slate-800 transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
