import React, { useState } from 'react';
import { symptomApi } from '../lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { 
    Activity, 
    MessageSquare, 
    Shield, 
    AlertCircle, 
    Stethoscope, 
    ArrowRight, 
    Sparkles, 
    ChevronRight,
    Send,
    RefreshCw
} from 'lucide-react';

const AISymptomChecker = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello, I am the SynapseCare AI Health Engine. Describe your symptoms in detail so I can analyze them for you.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleSend = async (e) => {
        e.preventDefault();
        
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        
        if (trimmedInput.length < 5) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                text: "Please describe your symptoms in more detail (at least 5 characters) so I can provide an accurate analysis." 
            }]);
            return;
        }

        const userMsg = { role: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Updated to use symptomApi and /check endpoint with correct payload structure
            const res = await symptomApi.post('/check', { symptoms: input });
            const data = res.data;
            
            // SymptomResponse mapping: { analysis, possibleConditions, recommendedSpecialties, urgencyLevel, disclaimer }
            const textResponse = data.analysis || "Analysis failed.";
            const suggestedSpecialty = (data.recommendedSpecialties && data.recommendedSpecialties.length > 0) 
                ? data.recommendedSpecialties[0] 
                : "General Physician";
            
            setAnalysis({ 
                specialty: suggestedSpecialty,
                urgency: data.urgencyLevel,
                disclaimer: data.disclaimer
            });

            const assistantMsg = { 
                role: 'assistant', 
                text: textResponse,
                recommendation: `Status: ${data.urgencyLevel || 'Informational'}. Specialty: ${suggestedSpecialty} recommended.`
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Service temporarily unavailable. Please seek local emergency care if urgent." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>AI Symptom Checker | Diagnostic Triage | SynapsCare</title>
                <meta name="description" content="AI-powered symptom analysis and medical triage for immediate healthcare guidance" />
            </Head>
            <div className="min-h-screen bg-[#F8FAFC] flex font-bold italic text-slate-900 border-t-8 border-indigo-600">
            {/* Sidebar / Info */}
            <div className="md:w-[450px] bg-slate-950 p-16 text-white flex flex-col justify-between italic overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="space-y-12 relative z-10">
                    <Link href="/" className="flex items-center gap-4 italic group">
                        <img src="/logo.png" alt="SynapseCare" className="w-10 h-10" />
                        <span className="text-2xl font-black italic tracking-tighter">SynapseCare AI</span>
                    </Link>

                    <div className="space-y-6 italic">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 italic">
                            <Sparkles className="w-8 h-8 italic" />
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter leading-tight italic">Medical <br /> Symphony Core.</h1>
                        <p className="text-slate-400 text-lg font-bold opacity-80 leading-relaxed italic font-bold uppercase tracking-widest text-[10px]">Version 4.0 - Active Diagnostics</p>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] italic space-y-4">
                        <div className="flex items-center gap-3 text-rose-400 italic">
                            <AlertCircle className="w-5 h-5 italic" /> <span className="text-xs font-black uppercase tracking-widest italic">Safety Protocol</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic font-bold">This AI provides preliminary guidance only. In case of a real medical emergency, please contact local emergency services immediately.</p>
                    </div>
                </div>

                <div className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-700 relative z-10 italic">Core Processing Active • Secure Link Enabled</div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden italic font-bold">
                <header className="p-8 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex justify-between items-center z-10 italic">
                    <div className="flex items-center gap-4 italic font-bold uppercase tracking-[0.3em] text-slate-400 text-[10px]">
                        <Activity className="w-4 h-4 text-emerald-500 italic animate-pulse" /> Virtual Diagnostic Session
                    </div>
                    <Link href="/" className="text-xs font-black text-slate-900 border-b-2 border-indigo-600 pb-1 italic">Terminate Session</Link>
                </header>

                <div className="flex-1 overflow-y-auto p-12 space-y-8 italic font-bold scroll-smooth">
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                key={i} 
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} italic font-bold`}
                            >
                                <div className={`max-w-2xl p-8 rounded-[2rem] shadow-xl ${m.role === 'user' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-white border border-slate-100 text-slate-900'} space-y-4 italic font-bold`}>
                                    <p className="text-lg font-bold italic leading-relaxed">{m.text}</p>
                                    {m.recommendation && (
                                        <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 italic">
                                            <Stethoscope className="w-6 h-6 italic" />
                                            <div className="font-black text-xs uppercase tracking-widest italic">{m.recommendation}</div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex justify-start italic">
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 text-slate-400 shadow-xl italic">
                                <RefreshCw className="w-5 h-5 animate-spin italic" /> <span className="text-xs font-black uppercase tracking-widest italic">Analyzing Biofactors...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-10 bg-white border-t border-slate-200 italic font-bold">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative italic font-bold">
                        <input 
                            value={input}
                            onChange={(e)=>setInput(e.target.value)}
                            placeholder="Describe your symptoms (e.g. 'I have a sharp pain in my chest...')" 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] py-8 px-12 text-lg font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner italic"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all italic">
                            <Send className="w-7 h-7 italic" />
                        </button>
                    </form>
                    
                    {analysis && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 max-w-4xl mx-auto italic font-bold">
                             <div className="p-10 bg-emerald-50 content-center border-2 border-emerald-100 rounded-[3rem] flex items-center justify-between italic">
                                <div className="space-y-2 italic font-bold">
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 italic">Recommended Next Step</div>
                                    <div className="text-2xl font-black text-slate-900 italic">Consult {analysis.specialty}</div>
                                </div>
                                <Link href="/register" className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all italic">
                                    Book Now <ArrowRight className="w-5 h-5 italic" />
                                </Link>
                             </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default AISymptomChecker;
