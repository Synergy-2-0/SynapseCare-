import React, { useState, useEffect, useRef } from 'react';
import { integrationApi } from '../lib/api';
import { 
    Send, 
    Bot, 
    User, 
    Activity, 
    Info, 
    ArrowLeft, 
    ShieldCheck, 
    History, 
    Sparkles,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Welcome to SynapseCare's AI Symptom Checker. I'm here to help you understand your symptoms before you see a doctor. How are you feeling today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await integrationApi.post('/ai/symptoms', input);
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.data }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm currently updating my medical library. Please consult a doctor directly for immediate help." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-bold italic text-slate-900 italic font-bold">
            <nav className="fixed top-0 w-full bg-white border-b border-slate-200 p-8 flex justify-between items-center z-50 shadow-2xl shadow-indigo-100 italic">
                <div className="flex items-center gap-6 italic">
                    <Link href="/dashboard/patient" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 shadow-xl hover:border-indigo-600 transition-all italic italic font-bold">
                        <ArrowLeft className="w-5 h-5 italic" />
                    </Link>
                    <div className="space-y-1 italic font-bold">
                         <div className="flex items-center gap-3 italic"><h1 className="text-3xl font-black italic tracking-tighter italic font-bold">AI Health Hub</h1><div className="p-1 px-3 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest italic border border-indigo-100">Smart Guidance</div></div>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic italic font-bold flex items-center gap-2 italic"><Sparkles className="w-3 h-3 text-indigo-600 animate-pulse italic" /> Instant Pre-Diagnosis Help</p>
                    </div>
                </div>
                <div className="flex gap-4 italic font-bold">
                    <button className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 italic hover:border-rose-600 hover:text-rose-600 transition-all italic shadow-xl"><Trash2 className="w-5 h-5 italic" /></button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black shadow-2xl flex items-center gap-3 hover:translate-y-[-2px] transition-all italic italic font-bold uppercase tracking-widest"><History className="w-4 h-4 italic" /> Chat History</button>
                </div>
            </nav>

            <main className="flex-1 flex max-w-5xl mx-auto w-full pt-44 pb-48 px-8 italic font-bold">
                <div className="flex-1 flex flex-col space-y-10 overflow-y-auto pr-4 custom-scrollbar italic font-bold" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} italic font-bold`}>
                            <div className={`flex gap-6 max-w-[85%] italic font-bold ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} italic`}>
                                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black italic shadow-2xl bg-white border border-slate-100 ${m.role === 'user' ? 'text-indigo-600 border-indigo-100' : 'text-slate-900 border-slate-200'} italic`}>
                                    {m.role === 'user' ? <User className="w-6 h-6 italic" /> : <Bot className="w-8 h-8 italic" />}
                                </div>
                                <div className={`p-8 rounded-[2.5rem] text-lg font-bold leading-relaxed italic shadow-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500 italic' : 'bg-white text-slate-900 border border-slate-100'} italic italic font-bold`}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start italic">
                             <div className="flex gap-6 items-center italic">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center font-black animate-pulse italic"><Bot className="w-8 h-8 text-indigo-600 italic" /></div>
                                <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse italic">Analyzing current symptoms...</div>
                             </div>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 w-full p-12 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-40 italic font-bold">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-6 relative italic font-bold group">
                    <div className="flex-1 relative italic font-bold">
                         <input 
                            type="text" 
                            placeholder="Describe how you're feeling today..."
                            className="w-full bg-white border-2 border-slate-100 rounded-[3rem] py-8 pl-10 pr-24 text-lg font-black text-slate-900 outline-none focus:border-indigo-600 shadow-2xl focus:ring-8 focus:ring-indigo-100 transition-all italic italic font-bold"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                         />
                         <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all italic"><Send className="w-6 h-6 italic" /></button>
                    </div>
                </form>
                <div className="text-center mt-10 space-y-2 italic font-bold">
                    <div className="flex items-center justify-center gap-3 text-slate-400 italic">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 italic" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic italic font-bold">Private & Encrypted Chat</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold italic italic font-bold uppercase tracking-[0.05em] uppercase px-4 max-w-2xl mx-auto italic italic font-bold">SynapseCare AI is a helpful tool but not a final diagnosis. In emergencies, please call your local doctor quickly.</p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
