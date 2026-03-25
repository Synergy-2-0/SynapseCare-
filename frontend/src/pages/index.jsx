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
    CheckCircle2,
    Star,
    Smartphone,
    Download,
    Lock,
    Users,
    ChevronRight,
    Award
} from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-bold italic text-slate-900 selection:bg-indigo-100 italic transition-all duration-500">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-100 z-50 px-12 py-8 flex justify-between items-center italic">
                <div className="flex items-center gap-4 italic group cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 transition-transform group-hover:rotate-12 italic font-bold">S</div>
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter">SynapseCare</span>
                </div>
                
                <div className="hidden lg:flex gap-16 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 italic font-bold">
                    {['Specialists', 'Technology', 'Testimonials', 'About'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-indigo-600 transition-all hover:tracking-[0.5em] duration-500 italic">{item}</a>
                    ))}
                </div>

                <div className="flex gap-6 italic">
                    <Link href="/login" className="px-10 py-4 text-slate-900 border-2 border-slate-100 rounded-[2rem] text-sm font-black hover:bg-slate-50 hover:border-indigo-600 transition-all italic">Sign In</Link>
                    <Link href="/register" className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-900/20 hover:scale-110 active:scale-95 transition-all italic">Launch Portal</Link>
                </div>
            </nav>

            <main className="pt-40 italic font-bold">
                {/* Hero Section */}
                <section className="px-12 mb-40 italic font-bold">
                    <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center italic">
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 italic">
                            <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-50 border-2 border-indigo-100 rounded-full text-indigo-700 text-[10px] font-black italic tracking-widest uppercase">
                                <Award className="w-4 h-4 italic" /> Rated #1 Global Health Platform 2026
                            </div>
                            <h1 className="text-9xl font-black text-slate-900 leading-[0.95] tracking-tighter italic">
                                Smart <br /> <span className="text-indigo-600 italic">Health.</span> <br /> No Limits.
                            </h1>
                            <p className="text-2xl text-slate-500 font-bold leading-relaxed max-w-xl italic opacity-80">
                                Integrated medical ecosystem featuring AI-driven diagnostics, instantaneous specialist matching, and encrypted health data management.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-8 py-6 italic font-bold">
                                <Link href="/chat" className="px-12 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all italic group">
                                    <Activity className="w-8 h-8 group-hover:rotate-180 transition-transform duration-700 italic" /> Start Diagnosis
                                </Link>
                                <div className="flex items-center gap-6 italic border-l-2 border-slate-100 pl-8">
                                    <div className="flex -space-x-6 italic">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-16 h-16 rounded-[1.5rem] border-4 border-white bg-slate-100 shadow-xl relative overflow-hidden italic transition-all hover:z-10 hover:scale-110">
                                                 <img src={`/images/doctor${(i%2)+1}.png`} alt="doctor" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-slate-900 italic">500+</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Global Experts</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative group italic font-bold">
                             <div className="absolute -inset-10 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"></div>
                             <div className="relative rounded-[5rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-slate-200 transform hover:rotate-3 transition-all duration-700 italic">
                                <img src="/images/hero.png" alt="Hero" className="w-full aspect-square object-cover" />
                             </div>
                             {/* Floating Card */}
                             <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-slate-50 space-y-4 italic font-bold scale-110">
                                <div className="flex items-center gap-4 italic">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white italic"><Calendar className="w-6 h-6 italic" /></div>
                                    <div>
                                        <div className="text-lg font-black italic">Next Appointment</div>
                                        <div className="text-xs font-bold text-slate-400 italic">In 45 Minutes • Dr. Smith</div>
                                    </div>
                                </div>
                             </div>
                        </motion.div>
                    </div>
                </section>

                {/* Services Section */}
                <section id="services" className="px-12 py-40 bg-slate-50 italic font-bold relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none italic">
                        <Activity className="w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    
                    <div className="max-w-8xl mx-auto relative z-10 italic">
                        <div className="text-center mb-32 space-y-6 italic">
                            <h2 className="text-7xl font-black text-slate-900 italic tracking-tighter uppercase italic">Comprehensive Care <br /> <span className="text-indigo-600 underline decoration-8 decoration-indigo-200">Modules</span></h2>
                            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto italic">Every feature engineered for maximum clinical accuracy and patient comfort.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 italic font-bold">
                            {[
                                { icon: Stethoscope, label: 'Advanced Diagnosis', desc: 'Precision medical analysis through our proprietary health algorithms.', color: 'text-indigo-600', bg: 'bg-white' },
                                { icon: Video, label: 'Virtual Telemedicine', desc: 'Latency-free 4K video consultations with end-to-end encryption.', color: 'text-rose-600', bg: 'bg-white' },
                                { icon: Lock, label: 'Encrypted Vault', desc: 'Your health records stored in a military-grade, SOC2 compliant cloud.', color: 'text-emerald-600', bg: 'bg-white' },
                                { icon: Smartphone, label: 'Mobile Synced', desc: 'Access your prescriptions and reports directly from your pocket.', color: 'text-amber-600', bg: 'bg-white' },
                                { icon: Users, label: 'Specialist Network', desc: 'Direct routes to the world\'s top 2% of medical specialists.', color: 'text-violet-600', bg: 'bg-white' },
                                { icon: Heart, label: 'Patient Support', desc: 'Dedicated 24/7 care coordination teams for every registered patient.', color: 'text-pink-600', bg: 'bg-white' },
                            ].map((s, i) => (
                                <div key={i} className={`${s.bg} p-16 rounded-[4rem] border border-slate-100 shadow-xl hover:shadow-[0_40px_80px_rgba(79,70,229,0.15)] transition-all duration-500 group cursor-pointer italic font-bold hover:-translate-y-4`}>
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-125 group-hover:rotate-6 shadow-xl ${s.color} bg-slate-50 shadow-indigo-100 italic`}>
                                        <s.icon className="w-10 h-10 italic" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-6 italic">{s.label}</h3>
                                    <p className="text-slate-500 text-lg font-bold leading-relaxed italic opacity-80">{s.desc}</p>
                                    <div className="mt-10 flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">
                                        Explore Module <ChevronRight className="w-4 h-4 italic" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mobile App Section */}
                <section className="px-12 py-40 italic font-bold">
                    <div className="max-w-7xl mx-auto rounded-[5rem] bg-indigo-600 p-24 text-white relative overflow-hidden shadow-[0_50px_100px_rgba(79,70,229,0.3)] group">
                        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-white/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 group-hover:scale-150"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center italic">
                            <div className="space-y-12 italic">
                                <div className="inline-flex px-6 py-2 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest italic">Now on iOS & Android</div>
                                <h3 className="text-8xl font-black italic tracking-tighter leading-[0.9] italic">Your Health, <br /> In Your Pocket.</h3>
                                <p className="text-2xl text-indigo-100 font-bold opacity-80 italic">Manage prescriptions, track real-time lab results, and chat with your care team instantly.</p>
                                <div className="flex gap-6 pt-8 italic font-bold">
                                    <button className="px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-xl flex items-center gap-4 hover:scale-110 active:scale-95 transition-all shadow-2xl italic">
                                        <Download className="w-7 h-7 italic" /> App Store
                                    </button>
                                    <button className="px-12 py-6 bg-indigo-500 text-white rounded-[2rem] font-black text-xl flex items-center gap-4 border-2 border-white/20 hover:bg-white hover:text-indigo-600 transition-all italic">
                                        Google Play
                                    </button>
                                </div>
                            </div>
                            <div className="relative flex justify-center italic font-bold">
                                <motion.div whileHover={{ y: -20, rotate: -5 }} className="relative z-10 w-full max-w-sm rounded-[4rem] overflow-hidden border-[12px] border-slate-900/10 shadow-3xl">
                                    <img src="/images/mobile_mock.png" alt="Mobile App" className="w-full object-cover" />
                                </motion.div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-white/20 rounded-full blur-[100px]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ / Trust Section */}
                <section id="technology" className="px-12 py-40 italic font-bold">
                    <div className="max-w-6xl mx-auto text-center space-y-24 italic">
                        <div className="space-y-8 italic">
                            <h2 className="text-7xl font-black text-slate-900 italic tracking-tighter italic">Why Choose <br /> <span className="text-indigo-600 italic">SynapseCare?</span></h2>
                            <p className="text-xl text-slate-400 font-bold max-w-2xl mx-auto italic">Industry-leading standards for security, speed, and clinical outcomes.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 italic font-bold">
                            {[
                                { val: '99.9%', label: 'Uptime Protocol' },
                                { val: '256-bit', label: 'E2E Encryption' },
                                { val: 'SOC2/HIPAA', label: 'Compliance' },
                                { val: '150+', label: 'Global Patents' }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-4 italic font-bold">
                                    <div className="text-6xl font-black text-slate-900 tracking-tighter italic">{stat.val}</div>
                                    <div className="text-[10px] uppercase font-black tracking-[0.4em] text-indigo-400 italic">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 text-white pt-40 pb-20 px-12 relative overflow-hidden italic font-bold">
                <div className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 italic font-bold"></div>
                
                <div className="max-w-8xl mx-auto space-y-32 relative z-10 italic">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 italic">
                        <div className="lg:col-span-5 space-y-12 italic">
                            <div className="flex items-center gap-4 italic font-bold">
                                <div className="w-14 h-14 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white font-black text-3xl italic">S</div>
                                <span className="text-4xl font-black italic tracking-tighter italic font-bold">SynapseCare.</span>
                            </div>
                            <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-md italic opacity-80">Leading the transition to proactive, data-driven, and patient-centric digital healthcare infrastructure.</p>
                            <div className="font-black text-[10px] uppercase tracking-[0.5em] text-indigo-500 italic">Built for the future of Medicine</div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16 italic font-bold">
                            {[
                                { title: 'Product', links: ['Cloud Sync', 'AI Engine', 'Telehealth', 'Vault'] },
                                { title: 'Network', links: ['Find Doctors', 'Clinics', 'Partners', 'Careers'] },
                                { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] }
                            ].map((g, i) => (
                                <div key={i} className="space-y-8 italic font-bold">
                                    <h4 className="text-[10px] uppercase font-black tracking-[0.5em] text-white italic">{g.title}</h4>
                                    <ul className="space-y-4 italic font-bold">
                                        {g.links.map(l => (
                                            <li key={l}><a href="#" className="text-slate-500 font-black text-sm hover:text-white transition-colors italic">{l}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-12 italic font-bold">
                        <div className="text-xs font-black text-slate-600 uppercase tracking-widest italic">© 2026 SynapseCare Digital. All Rights Reserved.</div>
                        <div className="flex gap-12 italic font-bold">
                            {['Twitter', 'LinkedIn', 'Github'].map(s => (
                                <a key={s} href="#" className="text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all italic">{s}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
