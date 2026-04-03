import React, { useState } from 'react';
import { symptomApi } from '../lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { 
    Activity, 
    Shield, 
    AlertCircle, 
    Stethoscope, 
    ArrowRight, 
    Sparkles, 
    ChevronRight,
    RefreshCw,
    Plus,
    X,
    Thermometer,
    Calendar,
    Wind,
    Droplets,
    ChevronLeft,
    CheckCircle2,
    Dna,
    Focus,
    Heart,
    Microscope,
    LogOut
} from 'lucide-react';

// Reusing generic brain/neuro placeholder
const Brain = ({ size = 20, strokeWidth = 1 }) => <Dna size={size} strokeWidth={strokeWidth} />;

const CATEGORIES = [
    { id: 'pain', icon: Focus, label: 'Pain', color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'respiratory', icon: Wind, label: 'Breathing', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'cardiac', icon: Heart, label: 'Cardiac', color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'neuro', icon: Brain, label: 'Neurological', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'general', icon: Thermometer, label: 'Fever/Flu', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'digestive', icon: Droplets, label: 'Digestive', color: 'text-orange-500', bg: 'bg-orange-50' }
];

const BODY_PARTS = ["Head", "Neck", "Chest", "Abdomen", "Back", "Arms", "Legs", "Joints", "Skin"];

const AISymptomChecker = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your SynapseCare AI Health Engine. Describe your symptoms in detail so I can analyze them for you.' }
    ]);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    // Wizard State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [duration, setDuration] = useState('1');
    const [severity, setSeverity] = useState(5);
    const [associatedSymptoms, setAssociatedSymptoms] = useState([]);
    const [customText, setCustomText] = useState('');
    const [wizardStep, setWizardStep] = useState(1);

    const toggleSymptom = (symp) => {
        setAssociatedSymptoms(prev => 
            prev.includes(symp) ? prev.filter(s => s !== symp) : [...prev, symp]
        );
    };

    const buildSymptomString = () => {
        let str = `I am experiencing ${selectedCategory ? selectedCategory.label.toLowerCase() : 'an issue'}`;
        if (selectedLocation) str += ` in my ${selectedLocation}`;
        str += ` for about ${duration} days.`;
        str += ` Severity level: ${severity}/10.`;
        if (associatedSymptoms.length > 0) str += ` Also feeling: ${associatedSymptoms.join(', ')}.`;
        if (customText) str += ` Other details: ${customText}`;
        return str;
    };

    const handleAIEnginePost = async () => {
        const fullPrompt = buildSymptomString();
        const userMsg = { role: 'user', text: fullPrompt };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await symptomApi.post('/check', { symptoms: fullPrompt });
            const data = res.data;
            const suggestedSpecialty = (data.recommendedSpecialties && data.recommendedSpecialties.length > 0) ? data.recommendedSpecialties[0] : "General Physician";
            
            setAnalysis({ 
                specialty: suggestedSpecialty,
                urgency: data.urgencyLevel,
                disclaimer: data.disclaimer
            });

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                text: data.analysis || "Analysis complete.",
                recommendation: `Status: ${data.urgencyLevel || 'Informational'}. Specialty: ${suggestedSpecialty} recommended.`
            }]);
            setWizardStep(4);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Service temporarily unavailable. Please seek local emergency care if urgent." }]);
        } finally {
            setLoading(false);
        }
    };

    const IconWrapper = ({ children, colorClass = "text-slate-400" }) => (
        <div className={`w-8 h-8 rounded flex items-center justify-center transition-all ${colorClass}`}>
            {React.cloneElement(children, { strokeWidth: 1.2, size: 20 })}
        </div>
    );

    return (
        <div className="h-screen bg-[#F9FBFC] flex flex-col font-sans overflow-hidden">
            <Head>
                <title>AI Symptom Checker | SynapseCare</title>
            </Head>

            {/* Navbar with raw logo */}
            <nav className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-50 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/patient" className="flex items-center gap-4 group">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 group-hover:scale-110 transition-transform" />
                        <div>
                            <span className="block text-xl font-black italic tracking-tighter text-slate-800 leading-none">SynapseCare AI</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Health Analysis Core</span>
                        </div>
                    </Link>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest hidden sm:block">AI Engine Active</span>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                
                {/* FIXED SIDEBAR (LEFT) */}
                <div className="w-[400px] bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
                    <div className="p-8 border-b border-slate-50">
                        <div className="flex justify-between items-end mb-1">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Diagnostic Wizard</h2>
                            <span className="text-[10px] font-black italic text-indigo-600">Step {wizardStep}/4</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full flex overflow-hidden">
                            <motion.div animate={{ width: `${(wizardStep / 4) * 100}%` }} className="bg-indigo-600" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            {wizardStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                    <h3 className="text-xl font-black italic tracking-tighter text-slate-800 italic">What's the main issue?</h3>
                                    <div className="grid grid-cols-1 gap-1">
                                        {CATEGORIES.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat); setWizardStep(2); }}
                                                className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${selectedCategory?.id === cat.id ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}
                                            >
                                                <IconWrapper colorClass={selectedCategory?.id === cat.id ? cat.color : "text-slate-300"}>
                                                    <cat.icon />
                                                </IconWrapper>
                                                <span className={`text-sm font-bold tracking-tight ${selectedCategory?.id === cat.id ? 'text-indigo-600' : 'text-slate-500'}`}>{cat.label}</span>
                                                <ChevronRight size={14} className={`ml-auto ${selectedCategory?.id === cat.id ? 'text-indigo-600' : 'text-slate-200'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {wizardStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                    <button onClick={() => setWizardStep(1)} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:opacity-70">
                                        <ChevronLeft size={12} /> Back to Categories
                                    </button>
                                    
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Where is the issue?</h4>
                                        <div className="grid grid-cols-3 gap-1">
                                            {BODY_PARTS.map(part => (
                                                <button 
                                                    key={part} onClick={() => setSelectedLocation(part)}
                                                    className={`py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all border ${selectedLocation === part ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'}`}
                                                >
                                                    {part}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">How many days?</h4>
                                        <select 
                                            value={duration} onChange={(e) => setDuration(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-50 rounded-xl text-xs font-bold outline-none focus:border-indigo-200 appearance-none shadow-inner"
                                        >
                                            <option value="1">Acute / Under 1 Day</option>
                                            <option value="2">2 Days</option>
                                            <option value="5">3-5 Days</option>
                                            <option value="7">1 Week</option>
                                            <option value="30">1 Month+</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex justify-between">
                                            <span>Severity</span>
                                            <span className="text-indigo-600 italic">{severity}/10</span>
                                        </h4>
                                        <input 
                                            type="range" min="1" max="10" value={severity}
                                            onChange={(e) => setSeverity(e.target.value)}
                                            className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => setWizardStep(3)}
                                        className="w-full py-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        Next Phase <ChevronRight size={14} />
                                    </button>
                                </motion.div>
                            )}

                            {wizardStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                    <button onClick={() => setWizardStep(2)} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:opacity-70">
                                        <ChevronLeft size={12} /> Back to Details
                                    </button>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Associated Factors</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {['Fatigue', 'Fever', 'Nausea', 'Dizziness', 'Cough', 'Rashes'].map(s => (
                                                <button 
                                                    key={s} onClick={() => toggleSymptom(s)}
                                                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border rounded-full transition-all ${associatedSymptoms.includes(s) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 italic' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">More Context</h4>
                                        <textarea 
                                            value={customText} onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="Tell us more about how you feel..."
                                            className="w-full h-32 p-6 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:border-indigo-200 text-xs font-bold leading-relaxed resize-none shadow-inner"
                                        />
                                    </div>

                                    <button 
                                        disabled={loading}
                                        onClick={handleAIEnginePost}
                                        className="w-full py-6 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-100 disabled:opacity-50"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />} 
                                        Launch Analysis
                                    </button>
                                </motion.div>
                            )}

                            {wizardStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                    <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 text-center flex flex-col items-center gap-4">
                                         <CheckCircle2 size={40} strokeWidth={1} className="text-emerald-500" />
                                         <p className="text-[11px] font-black uppercase italic tracking-widest text-emerald-700">Analysis Success</p>
                                    </div>
                                    <button 
                                        onClick={() => { setWizardStep(1); setAnalysis(null); setSelectedCategory(null); }}
                                        className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50"
                                    >
                                        Start New Analysis
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* END SESSION ACTION */}
                    <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                        <Link href="/dashboard/patient" className="w-full py-4 rounded-xl flex items-center justify-center gap-3 text-slate-400 hover:bg-white hover:text-rose-500 transition-all italic">
                            <LogOut size={16} strokeWidth={1.5} />
                            <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
                        </Link>
                    </div>
                </div>

                {/* SCROLLABLE FEED (RIGHT) */}
                <div className="flex-1 bg-[#F9FBFC] flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-12 space-y-12 pb-32 scrollbar-hide">
                         <div className="max-w-2xl mx-auto space-y-12">
                            {messages.map((m, i) => (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] p-8 rounded-[2.5rem] text-[15px] leading-relaxed relative border italic ${m.role === 'user' ? 'bg-slate-900 text-white border-slate-800 shadow-xl' : 'bg-white text-slate-600 border-slate-100 shadow-sm'}`}>
                                        <div className={`absolute top-0 -translate-y-1/2 px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${m.role === 'user' ? 'right-8 bg-indigo-600 text-white border-indigo-500' : 'left-8 bg-white text-slate-400 border-slate-50'}`}>
                                            {m.role === 'user' ? 'Your Symptoms' : 'AI Analysis'}
                                        </div>
                                        <p className="font-bold tracking-tight italic leading-relaxed">{m.text}</p>
                                        
                                        {m.recommendation && (
                                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-5">
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                                    <Stethoscope size={24} strokeWidth={1.2} />
                                                </div>
                                                <div className="text-xs font-black uppercase tracking-widest text-indigo-600 italic">{m.recommendation}</div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="p-8 bg-white border border-slate-100 rounded-2xl flex items-center gap-6 text-slate-400 shadow-sm">
                                        <RefreshCw className="animate-spin" size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">SynapseCare AI is Processing...</span>
                                    </div>
                                </div>
                            )}

                            {analysis && (
                                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="p-12 bg-indigo-600 text-white rounded-[3rem] space-y-10 shadow-3xl shadow-indigo-100">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 shadow-inner">
                                            <Microscope size={36} strokeWidth={1} />
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black italic tracking-tighter italic">Referral Match.</h4>
                                            <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Diagnostic Triage Recommendation</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 bg-black/10 rounded-[2rem] border border-white/5">
                                        <p className="text-[10px] text-indigo-100/40 mb-3 uppercase font-black tracking-widest italic leading-none">Consultation Channel</p>
                                        <p className="text-4xl font-black italic tracking-tighter tracking-tight italic leading-none">Expert {analysis.specialty}</p>
                                    </div>

                                    <Link href="/register" className="block w-full py-6 bg-white text-indigo-600 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.4em] hover:scale-[1.03] transition-all shadow-2xl shadow-indigo-900/20 active:scale-95">
                                        Initialize Consultation
                                    </Link>
                                </motion.div>
                            )}
                         </div>
                    </div>

                    <div className="h-10 bg-white/50 backdrop-blur-md border-t border-slate-100 flex items-center px-12 gap-5 absolute bottom-0 w-full z-20">
                        <AlertCircle size={10} className="text-slate-300" />
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">Safety Protocol: AI triage is for informational guidance only. Emergency cases must visit ER.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISymptomChecker;
