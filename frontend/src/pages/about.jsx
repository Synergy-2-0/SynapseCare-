import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
    Users, ShieldCheck, Globe, Award, Sparkles, 
    ChevronRight, ArrowRight, Heart, HeartPulse, Stethoscope
} from 'lucide-react';

const AboutPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <>
            <Head>
                <title>About Us | SynapsCare</title>
                <meta name="description" content="Learn about our mission to democratize healthcare through elite clinical intelligence." />
            </Head>
            
            <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
                {/* Navbar */}
                <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 lg:px-12 py-4 ${
                    scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'
                }`}>
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                            <img src="/logo.png" alt="SynapseCare" className="w-10 h-10 object-contain relative drop-shadow-sm transition-transform group-hover:scale-110" />
                            <span className="text-xl font-black tracking-tight text-slate-800">Synapse<span className="text-teal-600">Care</span></span>
                        </Link>
                        
                        <div className="hidden lg:flex gap-8 font-bold text-[13px] uppercase tracking-widest text-slate-500">
                            {[
                                { name: 'Technology', path: '/#technology' },
                                { name: 'How It Works', path: '/#how-it-works' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' }
                            ].map((item) => (
                                <Link key={item.name} href={item.path} className="hover:text-teal-600 transition-colors relative group py-2">
                                    {item.name}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-teal-600 transition-all duration-300 ${item.path === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/login" className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-teal-600 transition-all uppercase tracking-widest hidden sm:block">
                                Sign In
                            </Link>
                            <Link href="/register" className="bg-teal-600 text-white px-6 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                <main>
                    {/* Hero Section */}
                    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900 text-white">
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                            <div className="max-w-3xl space-y-8">
                                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 rounded-full text-teal-400 border border-teal-500/30 shadow-sm">
                                     <Sparkles size={14} />
                                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Our Mission</span>
                                 </motion.div>
                                 
                                 <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                                     Democratizing <br />
                                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Elite Healthcare.</span>
                                 </motion.h1>
                                 
                                 <motion.p initial="hidden" animate="visible" variants={fadeUp} className="text-base lg:text-lg text-slate-400 font-medium leading-relaxed">
                                     SynapseCare was founded on the belief that geography should not dictate the quality of care. We are building the infrastructure for a unified, global medical network.
                                 </motion.p>
                            </div>
                        </div>
                    </section>

                    {/* Values Section */}
                    <section className="py-24 lg:py-32 bg-white">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                                {[
                                    { title: 'Clinical Precision', desc: 'Every line of code and every clinical protocol is measured against the highest standards of medical accuracy.', icon: ShieldCheck },
                                    { title: 'Global Accessibility', desc: 'Connecting patients in underserved regions with top-tier specialists through our distributed care network.', icon: Globe },
                                    { title: 'Patient Agency', desc: 'Empowering individuals with complete ownership and portability of their health data through secure clinical logs.', icon: HeartPulse }
                                ].map((value, i) => (
                                    <div key={i} className="space-y-6">
                                        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                                            <value.icon size={24} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">{value.title}</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed text-base">{value.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Team/Impact Section */}
                    <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12">
                            <div className="flex flex-col lg:flex-row gap-20 items-center">
                                <div className="lg:w-1/2 relative">
                                    <div className="absolute inset-0 bg-teal-600/10 rounded-[3rem] blur-3xl -z-10" />
                                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200" alt="team" className="rounded-[3rem] border border-slate-200 shadow-2xl" />
                                </div>
                                <div className="lg:w-1/2 space-y-12">
                                    <div className="space-y-4">
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">The Power of Choice</span>
                                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Led by Medical Innovators.</h2>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                            Our team consists of senior medical practitioners, software architects, and data scientists dedicated to engineering a safer clinical future.
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <div className="text-4xl font-black text-teal-600 mb-2">500+</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Specialists</div>
                                        </div>
                                        <div>
                                            <div className="text-4xl font-black text-teal-600 mb-2">12k+</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lives Impacted</div>
                                        </div>
                                    </div>

                                    <Link href="/register" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all group">
                                        Join Our Mission <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Partners Section */}
                    <section className="py-24 bg-white border-t border-slate-100">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-12">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Partners</h4>
                            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
                                {/* Placeholder Partner Icons */}
                                <div className="text-2xl font-black text-slate-300">MEDCORE</div>
                                <div className="text-2xl font-black text-slate-300">BIOHEALTH</div>
                                <div className="text-2xl font-black text-slate-300">CLINIQUEST</div>
                                <div className="text-2xl font-black text-slate-300">GENESIS HR</div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-slate-50 border-t border-slate-200 py-12">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6" />
                            <span className="text-lg font-black tracking-tight text-slate-800">Synapse<span className="text-teal-600">Care</span></span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">© 2026 SynapseCare Platform. All rights reserved.</p>
                        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <Link href="/about" className="hover:text-teal-600">About</Link>
                            <Link href="/contact" className="hover:text-teal-600">Contact</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default AboutPage;
