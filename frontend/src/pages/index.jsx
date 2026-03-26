import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Shield, Stethoscope, Video, MessageSquare, 
    ArrowRight, Heart, CheckCircle2, 
    Star, Smartphone, Download, Lock, Users, ChevronRight,
    Zap, Globe, ShieldCheck, Microscope
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 lg:px-16 py-5 flex justify-between items-center ${
                scrolled ? 'bg-white/70 backdrop-blur-2xl border-b border-slate-200/40 shadow-premium' : 'bg-transparent'
            }`}>
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img src="/logo.png" alt="SynapseCare" className="w-10 h-10 object-contain relative drop-shadow-sm transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-800 font-display">Synapse<span className="text-indigo-600">Care</span></span>
                </div>
                
                <div className="hidden lg:flex gap-10 font-bold text-[13px] uppercase tracking-widest text-slate-500">
                    {['Specialties', 'Technology', 'Network', 'About'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-indigo-600 transition-colors relative group py-2">
                            {item}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full" />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/login" className="hidden sm:block text-[13px] font-bold text-slate-500 hover:text-indigo-600 transition-colors tracking-widest uppercase">Login</Link>
                    <Link href="/register" className="btn-primary flex items-center gap-2 group shadow-indigo-600/20">
                        Join Platform <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </nav>

            <main>
                {/* Hero Section - The "Showstopper" */}
                <section className="relative pt-40 pb-32 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[100px] -translate-x-1/2 pointer-events-none" />
                    
                    <div className="container mx-auto px-6 lg:px-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="lg:col-span-6 space-y-10 relative z-10 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/50 backdrop-blur-md border border-slate-200 rounded-full shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Global Medical Infrastructure • 2026</span>
                                </div>
                                <h1 className="title-display">
                                    Intelligent <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 leading-tight">Digital Clinic.</span> <br />
                                    <span className="relative">
                                        Reimagined.
                                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-100 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0,5 Q50,0 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
                                        </svg>
                                    </span>
                                </h1>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    A high-performance ecosystem for clinical care, telemedicine, and secure diagnostics powered by state-of-the-art AI architecture.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5 pt-4 justify-center lg:justify-start">
                                    <Link href="/doctors" className="btn-primary px-10 py-5 text-lg">
                                        Find Specialist
                                    </Link>
                                    <Link href="/chat" className="btn-secondary px-10 py-5 text-lg flex items-center gap-3">
                                        <Activity className="w-6 h-6 text-indigo-600" /> AI Triage Assistant
                                    </Link>
                                </div>
                                
                                <div className="pt-10 flex items-center justify-center lg:justify-start gap-12 border-t border-slate-200/50 mt-8">
                                    {[
                                        { val: '250k+', label: 'Patients' },
                                        { val: '1.2k', label: 'Practitioners' },
                                        { val: '99.9%', label: 'Uptime' }
                                    ].map((s, i) => (
                                        <div key={i} className="text-center lg:text-left">
                                            <div className="text-2xl font-black text-slate-900">{s.val}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="lg:col-span-6 relative">
                                <div className="relative w-full aspect-square md:aspect-video lg:aspect-square">
                                    {/* High Performance Medical Illustration */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-[3rem] blur-3xl" />
                                    <img src="/healthcare_hero_v3.png" alt="Medical Technology" className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-float" />
                                    
                                    {/* Glass Floating UI elements */}
                                    <motion.div animate={{ y: [0, -15, 0], x: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} 
                                        className="absolute -top-4 right-10 p-6 glass-morphism rounded-[2rem] z-20 flex flex-col gap-3 shadow-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl grid place-items-center"><ShieldCheck size={20} /></div>
                                            <div>
                                                <div className="text-xs font-black text-slate-900 leading-none mb-1">Clinic Verified</div>
                                                <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Identity</div>
                                            </div>
                                        </div>
                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                                        </div>
                                    </motion.div>

                                    <motion.div animate={{ y: [0, 15, 0], x: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} 
                                        className="absolute -bottom-6 left-10 p-6 glass-morphism rounded-[2rem] z-20 flex items-center gap-4 shadow-2xl border border-white/50">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl grid place-items-center shadow-inner"><Activity size={24} /></div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">Platform Sync</div>
                                            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Health Core Connected</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section - Clean & Modern Grid */}
                <section className="py-32 bg-white relative">
                    <div className="container mx-auto px-6 lg:px-16">
                        <div className="max-w-3xl mb-24 space-y-6">
                            <Badge variant="primary">Core Capabilities</Badge>
                            <h2 className="title-display text-4xl leading-tight">Miniaturized complexity for <span className="text-indigo-600">modern medicine.</span></h2>
                            <p className="text-lg text-slate-500 font-medium">Breathable, high-trust software designed to bridge the gap between clinics and patients.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: '4K Telehealth', desc: 'Secure encryption-grade video consultations with sub-50ms latency.', icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { title: 'AI Diagnostics', desc: 'Pre-clinical symptom modeling using specialized medical LLMs.', icon: Zap, color: 'text-sky-600', bg: 'bg-sky-50' },
                                { title: 'Health Vault', desc: 'Universal access to prescriptions, labs, and MRI records.', icon: Lock, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { title: 'Global Grid', desc: 'Connect with over 500+ clinics and verified experts worldwide.', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map((feat, i) => (
                                <div key={i} className="p-10 surface-card surface-card-hover group">
                                    <div className={`w-16 h-16 ${feat.bg} ${feat.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                                        <feat.icon size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">{feat.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Split Visual Section - "The Future of Care" */}
                <section className="py-32 bg-slate-50">
                    <div className="container mx-auto px-6 lg:px-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="relative group overflow-hidden rounded-[3rem] p-16 flex flex-col justify-between min-h-[500px] border border-slate-200 bg-white shadow-premium">
                                <div className="relative z-20 space-y-6">
                                    <Badge variant="primary">Patient Experience</Badge>
                                    <h3 className="text-4xl font-black tracking-tight text-slate-900">Clinically precise <br /> Health Vault.</h3>
                                    <p className="text-slate-500 font-medium max-w-sm">Every scan, every dose, every visit. Sync your entire history into one beautiful timeline.</p>
                                </div>
                                <img src="/consultation_v3.png" alt="Clinical Vault" className="absolute -bottom-10 -right-20 w-[110%] object-contain group-hover:scale-105 transition-transform duration-1000" />
                            </div>

                            <div className="relative group overflow-hidden rounded-[3rem] p-16 flex flex-col justify-between min-h-[500px] border border-indigo-100 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 -z-10" />
                                <div className="relative z-20 space-y-6">
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Doctor Practice</span>
                                    <h3 className="text-4xl font-black tracking-tight leading-tight">Advanced Practice <br /> OS for Specialists.</h3>
                                    <p className="text-indigo-100/80 font-medium max-w-sm">Streamlined e-prescribing, waitlist automation, and high-definition virtual care tools.</p>
                                    <div className="pt-6">
                                        <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
                                            Request Practice Demo <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                                {/* Pattern background decorative */}
                                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Call to Action */}
                <section className="py-40 bg-white relative overflow-hidden">
                    <div className="container mx-auto px-6 lg:px-16 text-center">
                        <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto space-y-10">
                            <div className="inline-flex justify-center -space-x-4 mb-6">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-premium">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                                    </div>
                                ))}
                            </div>
                            <h2 className="title-display">Ready for the future of <span className="text-indigo-600">health?</span></h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">Join over 1,200 practitioners and 250,000 patients already using SynapseCare for unified digital clinical care.</p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                                <Link href="/register" className="btn-primary px-12 py-5 text-lg">Create Free Account</Link>
                                <button className="btn-secondary px-12 py-5 text-lg flex items-center gap-3">
                                    <Download size={20} /> Download Portal App
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-900 pt-32 pb-16 px-6 lg:px-16 text-white text-slate-400">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 mb-24">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="Logo" className="w-10 h-10 brightness-110" />
                                <span className="text-2xl font-black tracking-tight text-white leading-none">Synapse<span className="text-indigo-400">Care</span></span>
                            </div>
                            <p className="font-medium text-sm leading-relaxed max-w-sm">
                                High-performance medical cloud with intelligent e-prescribing and unified patient timelines. Building the next generation of global clinical standards.
                            </p>
                            <div className="flex gap-4">
                                {['tw', 'li', 'gh'].map(s => (
                                    <div key={s} className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer grid place-items-center"><Shield size={16} /></div>
                                ))}
                            </div>
                        </div>

                        {[
                            { t: 'Product', l: ['Telehealth', 'Diagnostics', 'Pharmacy', 'Health Vault'] },
                            { t: 'Resources', l: ['Documentation', 'Guides', 'Support Center', 'Release Notes'] },
                            { t: 'Privacy', l: ['Compliance', 'HIPAA/SOC2', 'Data Security', 'Legal'] },
                            { t: 'Company', l: ['Our Mission', 'Careers', 'Inquiry', 'Contact'] },
                        ].map((g, i) => (
                            <div key={i} className="space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{g.t}</h4>
                                <ul className="space-y-4 font-bold text-sm tracking-wide">
                                    {g.l.map(link => (
                                        <li key={link}><a href="#" className="hover:text-indigo-400 transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        <div>© 2026 SynapseCare Digital Systems Inc. All rights reserved.</div>
                        <div className="flex gap-10">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Term of Clinical Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const Badge = ({ children, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        danger: 'bg-rose-50 text-rose-600 border-rose-100'
    };
    return (
        <span className={`px-4 py-1 rounded-full text-[10px] font-black border ${variants[variant]} uppercase tracking-[0.2em] inline-block`}>
            {children}
        </span>
    );
};

export default LandingPage;
