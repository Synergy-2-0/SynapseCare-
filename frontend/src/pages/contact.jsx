import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Phone, MapPin, Send, MessageSquare, 
    Sparkles, ArrowRight, HelpCircle, FileText
} from 'lucide-react';

const ContactPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        setTimeout(() => setFormStatus('success'), 1500);
    };

    return (
        <>
            <Head>
                <title>Contact Support | SynapsCare</title>
                <meta name="description" content="Get in touch with our clinical support team or sales department." />
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
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-teal-600 transition-all duration-300 ${item.path === '/contact' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
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

                <main className="pt-32 lg:pt-48 pb-24 lg:pb-40">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                            {/* Left Side: Info */}
                            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-12">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 rounded-full text-teal-600 border border-teal-100/50 shadow-sm">
                                         <MessageSquare size={14} />
                                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Clinical Hub</span>
                                     </div>
                                     <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900 leading-[1.1]">
                                         We are here to <br />
                                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Enable Better Care.</span>
                                     </h1>
                                     <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                                         Whether you are a healthcare provider or a patient, our team is available to assist with onboarding, technical support, and clinical inquiries.
                                     </p>
                                 </div>

                                 <div className="space-y-8">
                                     {[
                                         { icon: Mail, label: 'Email Outreach', val: 'support@synapsecare.com', desc: 'Typical response time: < 2 hours' },
                                         { icon: Phone, label: 'Global Hotline', val: '+1 (800) SYNAPSE', desc: 'Clinical emergencies & critical support' },
                                         { icon: MapPin, label: 'Headquarters', val: '300 Innovation Way, Palo Alto, CA', desc: 'Bridging medical ethics & technology' }
                                     ].map((item, i) => (
                                         <div key={i} className="flex gap-6 group">
                                             <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm group-hover:border-teal-100 group-hover:shadow-lg transition-all">
                                                 <item.icon size={20} />
                                             </div>
                                             <div className="space-y-1">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                                                 <p className="text-base font-black text-slate-900">{item.val}</p>
                                                 <p className="text-xs font-medium text-slate-500">{item.desc}</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                            </motion.div>

                            {/* Right Side: Form */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-premium border border-slate-100 relative">
                                <div className="absolute -top-6 -right-6 p-5 bg-teal-600 text-white rounded-3xl shadow-xl shadow-teal-100 hidden md:block">
                                    <Sparkles size={24} />
                                </div>
                                
                                {formStatus === 'success' ? (
                                    <div className="text-center py-12 space-y-6">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Send size={32} />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900">Message Transmitted.</h2>
                                        <p className="text-sm text-slate-500 font-medium">Your inquiry has been logged in our secure clinical queue. A representative will contact you shortly.</p>
                                        <button onClick={() => setFormStatus('idle')} className="text-teal-600 font-black uppercase tracking-widest text-xs pt-4 hover:underline">Send another message</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                                <input required type="text" placeholder="Dr. John Smith" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Endpoint</label>
                                                <input required type="email" placeholder="john@hospital.org" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none appearance-none">
                                                <option>General Inquiry</option>
                                                <option>Clinical Collaboration</option>
                                                <option>Technical Support</option>
                                                <option>Partnership Proposal</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Detail</label>
                                            <textarea required rows="4" placeholder="Describe your inquiry with clinical context..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none resize-none" />
                                        </div>
                                        <button disabled={formStatus === 'sending'} className="w-full bg-teal-600 text-white py-4 rounded-xl font-black text-base hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-3 group">
                                            {formStatus === 'sending' ? 'Transmitting...' : (
                                                <>
                                                    Transmit Secure Message
                                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest justify-center">
                                            <FileText size={12} />
                                            End-to-end encrypted channel
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-slate-50 border-t border-slate-200 py-12">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-8">
                        <div className="flex items-center gap-3 justify-center">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6" />
                            <span className="text-lg font-black tracking-tight text-slate-800">Synapse<span className="text-teal-600">Care</span></span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">© 2026 SynapseCare Platform. Global Clinical Network.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default ContactPage;
