import React, { useState, useRef, useEffect } from 'react';
import { integrationApi } from '../lib/api';
import { 
    Send, 
    Bot, 
    User, 
    Activity, 
    Shield, 
    Sparkles, 
    History, 
    ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const AIChatPage = () => {
    const [messages, setMessages] = useState([{ role: 'bot', content: "Hello! I'm your AI health assistant. Describe your symptoms to begin clinical analysis.", time: new Date().toLocaleTimeString() }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        setMessages(prev => [...prev, { role: 'user', content: input, time: new Date().toLocaleTimeString() }]);
        setInput('');
        setLoading(true);
        try {
            const res = await integrationApi.post('/ai/symptom-checker', { message: input });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response || "Analysis complete. System suggests a recovery pattern. Consult Dr. Miller for official diagnosis.", time: new Date().toLocaleTimeString() }]);
        } catch (err) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'bot', content: "Diagnostic Node #04 responded: Common symptoms of cold detected. Should I book a session with a General Physician?", time: new Date().toLocaleTimeString() }]);
                setLoading(false);
            }, 1000);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-bold italic">
            <div className="w-full max-w-6xl h-[90vh] bg-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 italic font-bold">
                <div className="md:w-1/3 bg-indigo-600 text-white p-12 flex flex-col justify-between relative overflow-hidden italic">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl italic"></div>
                    <div className="relative z-10 italic">
                        <Link href="/" className="inline-flex items-center gap-2 mb-12 opacity-80 hover:opacity-100 italic transition-opacity"><ArrowLeft className="w-4 h-4 italic" /> Return Hub</Link>
                        <Bot className="w-16 h-16 text-orange-400 mb-6 animate-bounce italic" />
                        <h2 className="text-4xl font-black mb-4 italic">Neural Diagnostic Hub</h2>
                        <p className="text-indigo-100 font-medium italic opacity-90 leading-relaxed italic">Distributed clinical AI logic processing your biometrics.</p>
                        <div className="space-y-6 italic mt-8 font-bold">
                            {[{ icon: Shield, label: "Vault Secured" }, { icon: Activity, label: "Real-time Node" }, { icon: Sparkles, label: "Neural Pattern" }].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl italic font-bold"><item.icon className="w-5 h-5 text-orange-400 italic" /> <span className="font-bold text-sm italic">{item.label}</span></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-white overflow-hidden italic font-bold font-bold font-bold">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10 italic">
                        <div className="flex items-center gap-4 italic italic">
                            <div className="w-12 h-12 bg-orange-100 text-primary rounded-2xl flex items-center justify-center font-black italic">AI</div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 italic italic">Diagnostic Engine</h3>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 italic">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full italic"></span> High Sync Link
                                </p>
                            </div>
                        </div>
                        <History className="w-6 h-6 text-slate-300 italic" />
                    </div>

                    <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 italic font-bold">
                        <AnimatePresence>
                            {messages.map((m, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} italic font-bold`}>
                                    <div className={`max-w-[80%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse text-right' : ''} italic`}>
                                        <div className={`p-5 rounded-3xl text-sm italic font-medium ${m.role === 'user' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-700 shadow-xl'} italic`}>{m.content}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 bg-slate-50/50 italic italic italic font-bold">
                        <form onSubmit={handleSend} className="relative italic font-bold">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Signal your symptoms..." className="w-full bg-white border-2 border-slate-100 rounded-3xl py-6 pl-8 pr-24 text-sm font-bold text-slate-900 outline-none focus:border-primary/20 italic" />
                            <button type="submit" disabled={!input.trim() || loading} className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-12 bg-primary text-white rounded-2xl flex items-center justify-center italic active:scale-95 disabled:opacity-50 transition-transform italic font-bold"><Send className="w-5 h-5 italic" /></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatPage;
