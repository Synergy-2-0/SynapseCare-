import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
    Activity, Shield, MessageSquare, ArrowRight, ShieldCheck, Globe, Cpu, Database, Layers, Fingerprint,
    Microscope, Plus, Sparkles, Clock, Calendar, Search, BarChart3, Zap, ChevronRight, Star
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-teal-50 selection:text-teal-900 overflow-x-hidden">
            <Head>
                <title>SynapsCare | The Enterprise Clinical OS</title>
                <meta name="description" content="The world's most advanced clinical operating system for high-performance healthcare institutions." />
            </Head>

            {/* Premium Navigation */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 lg:px-12 ${scrolled ? 'py-4' : 'py-8'}`}>
                <div className={`max-w-7xl mx-auto flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-3xl border border-white/40 shadow-premium-lg rounded-[2.5rem] px-8 py-3' : 'bg-transparent'}`}>
                    <Link href="/" className="flex items-center gap-3 group translate-z-0">
                        <div className="relative">
                            <img src="/logo.png" alt="SynapseCare" className="w-10 h-10 object-contain transition-transform duration-700 group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">Synapse<span className="text-teal-600">Care</span></span>
                    </Link>

                    <div className="hidden lg:flex gap-10 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">
                        {['Technology', 'Workflow', 'Mission', 'Contact'].map((item) => (
                            <Link key={item} href={item === 'Mission' ? '/about' : item === 'Contact' ? '/contact' : `/#${item.toLowerCase()}`} className="hover:text-teal-600 transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-8">
                        <Link href="/login" className="text-[10px] font-black text-slate-500 hover:text-teal-600 transition-all uppercase tracking-[0.3em]">
                            Clinical Access
                        </Link>
                        <Link href="/register" className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-teal-600 hover:shadow-premium-xl transition-all duration-500 hover:-translate-y-1">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Ultra-Modern Hero v9 */}
                <section className="relative min-h-[95vh] flex items-center pt-32 pb-24 overflow-hidden bg-[#F8FAFC]">
                    {/* Architectural Background */}
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.08),transparent_50%)]" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent,rgba(241,245,249,0.5))] -z-10" />
                    
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
                        <div className="flex flex-col lg:flex-row gap-24 items-center">
                            {/* Content Column */}
                            <motion.div 
                                variants={stagger} 
                                initial="hidden" 
                                animate="visible" 
                                className="lg:w-[45%] space-y-12 relative z-10"
                            >
                                <motion.div variants={fadeUp} className="space-y-6 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white shadow-premium-sm rounded-full border border-teal-100/30">
                                        <div className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-800">Operational Excellence • v9.0</span>
                                    </div>
                                    <h1 className="text-6xl lg:text-[5.5rem] font-extrabold text-slate-900 leading-[0.9] tracking-tight">
                                        The Clinical <br /> 
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Intelligence</span> <br />
                                        Mainframe.
                                    </h1>
                                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                        High-performance clinical infrastructure for modern healthcare institutions. Unified diagnostics, verification, and telemetry.
                                    </p>
                                </motion.div>
                                
                                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start">
                                    <Link href="/register" className="bg-teal-600 text-white px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-teal-700 shadow-premium-2xl shadow-teal-100/50 transition-all duration-500 flex items-center justify-center gap-4 group">
                                        Get Started <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500" />
                                    </Link>
                                    <Link href="/about" className="bg-white text-slate-900 border border-slate-200 px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-slate-50 transition-all duration-500 flex items-center justify-center gap-3 shadow-premium-sm">
                                        Learn Mission
                                    </Link>
                                </motion.div>
                                
                                <motion.div variants={fadeUp} className="pt-8 flex flex-wrap justify-center lg:justify-start items-center gap-12 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Star size={16} className="text-teal-500 fill-teal-500" />
                                            <span className="text-lg font-black text-slate-900">Elite Tier</span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Institutional Rating</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={18} className="text-teal-500" />
                                            <span className="text-lg font-black text-slate-900">99.9%</span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Network Uptime</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Visual Column */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="lg:w-[55%] relative"
                            >
                                <div className="absolute -inset-10 bg-teal-500/10 rounded-full blur-[150px] animate-pulse -z-10" />
                                
                                <div className="relative z-10">
                                    <div className="relative rounded-[4rem] overflow-hidden shadow-premium-3xl border border-white bg-white/50 backdrop-blur-3xl group">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/10 to-transparent z-10 pointer-events-none" />
                                        <img 
                                            src="/ultra_pro_clinical_os_hero_1776358513763.png" 
                                            alt="Clinical OS" 
                                            className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" 
                                        />
                                        
                                        {/* Dynamic UI Overlays */}
                                        <motion.div 
                                            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
                                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-12 left-12 p-6 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-premium-2xl border border-white z-20 hidden md:flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Live Metrics</p>
                                                <p className="text-base font-black text-slate-900">Standard Operation</p>
                                            </div>
                                        </motion.div>

                                        <motion.div 
                                            animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute bottom-12 right-12 p-8 bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-premium-3xl border border-white/10 text-white z-20 max-w-[300px] hidden md:block"
                                        >
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Security Index</span>
                                                    <ShieldCheck size={18} className="text-teal-400" />
                                                </div>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-teal-500 w-[94%]" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                                    Authoritative medical networking verified for sovereign institutions.
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Partners Marquee */}
                <section className="py-24 bg-white border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex flex-wrap justify-center items-center gap-16 lg:gap-32 opacity-30 grayscale hover:opacity-100 transition-opacity duration-1000">
                            {['MEDCORE', 'BIOHEALTH', 'CLINIQUEST', 'GENESIS HR', 'ISO SYSTEM'].map((brand) => (
                                <span key={brand} className="text-3xl font-black tracking-tighter text-slate-900">{brand}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Clinical Intelligence Marquee */}
                <section id="technology" className="py-40 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-12">
                            <div className="max-w-2xl space-y-8">
                                <div className="inline-flex items-center gap-3 px-5 py-2 bg-teal-50 rounded-full">
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">Clinical Architecture</span>
                                </div>
                                <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[0.9] tracking-tighter">
                                    Engineering the next era of <span className="text-teal-600">Healthcare.</span>
                                </h2>
                            </div>
                            <p className="text-xl text-slate-500 font-medium max-w-sm leading-relaxed mb-4">
                                Distributed medical platform built for high-performance and absolute diagnostic privacy.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: 'Predictive Triage', desc: 'Case analysis reducing patient intake latency by 85%.', icon: Cpu },
                                { title: 'Sovereign Records', desc: 'Immutable clinical history storage with full data ownership.', icon: Database },
                                { title: 'Verified Identity', desc: 'Advanced credential verification for clinical institution access.', icon: ShieldCheck },
                                { title: 'Infinite Scale', desc: 'Processing 100k+ clinical events per second with zero latency.', icon: Layers }
                            ].map((feat, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ y: -12 }}
                                    className="p-12 rounded-[3rem] bg-white border border-slate-200 shadow-premium-sm hover:shadow-premium-xl transition-all duration-700"
                                >
                                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-10">
                                        <feat.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-6">{feat.title}</h3>
                                    <p className="text-base text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Premium Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-5 gap-20 mb-32">
                    <div className="lg:col-span-2 space-y-10 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                            <span className="text-xl font-black tracking-tighter uppercase">SynapseCare</span>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
                            The advanced clinical operating system for institutional healthcare excellence.
                        </p>
                        <div className="flex justify-center lg:justify-start gap-6">
                            {[Globe, Shield, Activity, Fingerprint].map((Icon, i) => (
                                <div key={i} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all cursor-pointer shadow-premium-sm">
                                    <Icon size={24} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {[
                        { t: 'Structure', l: ['Technology', 'Workflow', 'System Status', 'Safety Lab'] },
                        { t: 'Governance', l: ['About Us', 'Contact Space', 'Institutional Kit', 'Open Roles'] },
                        { t: 'Compliance', l: ['Privacy Shield', 'Data Ethics', 'HIPAA Baseline', 'SOC2 Standard'] }
                    ].map((g, i) => (
                        <div key={i} className="space-y-10 text-center lg:text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">{g.t}</h4>
                            <ul className="space-y-6">
                                {g.l.map(link => (
                                    <li key={link}>
                                        <Link href="#" className="text-sm font-black text-slate-600 hover:text-teal-600 transition-colors uppercase tracking-[0.1em]">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">© 2026 SynapseCare • Sovereign Clinical Architecture</p>
                    <div className="flex items-center gap-4 text-[10px] font-black text-teal-600 uppercase tracking-[0.4em]">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span>Clinical Status: Optimal</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
