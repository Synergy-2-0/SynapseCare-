import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { Video, Clock, ChevronRight, Mic, Camera, MonitorUp, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const postSessionSchema = z.object({
  notes: z.string().min(10, "Detailed notes to proceed"),
});

export default function TelemedicineCenter() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [inSession, setInSession] = useState(false);
    const [showPostSession, setShowPostSession] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(postSessionSchema)
    });

    useEffect(() => {
        let interval;
        if (inSession) {
            interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [inSession]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleEndSession = () => {
        setInSession(false);
        setElapsedTime(0);
        setShowPostSession(true);
    };

    const onSubmitSummary = async (data) => {
        await new Promise(r => setTimeout(r, 600)); // Simulate save
        setShowPostSession(false);
    };

    if (!mounted || inSession) {
        if (!mounted) return null; // Or return a LoadingSpinner if you have it imported
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
                <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-slate-900">
                    <div className="flex items-center gap-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div className="font-bold tracking-tight">LIVE � Nimal Perera � {formatTime(elapsedTime)}</div>
                    </div>
                    <button onClick={handleEndSession} className="text-white/50 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 bg-slate-950 flex flex-col justify-end p-8 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center text-white/20">
                                <Video size={48} />
                            </div>
                        </div>
                        <div className="relative z-10 flex justify-center gap-4 py-6 bg-gradient-to-t from-black/80 to-transparent">
                            <button className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <Mic size={24} />
                            </button>
                            <button className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <Camera size={24} />
                            </button>
                            <button className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <MonitorUp size={24} />
                            </button>
                            <button 
                                onClick={handleEndSession}
                                className="px-8 h-14 rounded-full bg-red-600 hover:bg-red-700 font-bold tracking-wide flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                    <div className="w-[320px] bg-slate-900 border-l border-white/10 flex flex-col">
                        <div className="flex items-center gap-2 p-2 bg-slate-800 m-4 rounded-lg">
                            {['Notes', 'Reports', 'Chat'].map(tab => (
                                <button key={tab} className={'flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ' + (tab === 'Notes' ? 'bg-slate-700 text-white' : 'text-slate-400')}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-4">
                            <textarea 
                                className="w-full h-full bg-transparent resize-none outline-none text-white/90 placeholder:text-white/30 text-sm font-medium"
                                placeholder="Type your session notes here... Autosaves every 30s."
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <DashboardLayout>
            <Header title="Consultations" subtitle="Telemedicine & active virtual care hub" />
            <div className="flex gap-2 border-b border-[var(--border-color)] mt-8">
                {['Live Now', 'Upcoming', 'Past Sessions'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={'px-4 py-3 text-sm font-bold transition-colors ' + (activeTab === tab ? 'text-teal-600 border-b-2 border-teal-500' : 'text-slate-400 hover:text-slate-600')}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="consult-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-teal)] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-6 max-w-4xl">
                {activeTab === 'Upcoming' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-card)] border-l-[3px] border-l-[var(--accent-teal)] border-y border-r border-[var(--border-color)] rounded-r-[var(--radius-lg)] p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-6 hover:shadow-md transition-all group">
                        <div className="space-y-4 flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded border border-amber-200 animate-pulse">
                                <Clock size={14} /> Starts in 12 minutes
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Nimal Perera</h3>
                                <p className="text-[var(--text-secondary)] font-medium text-sm mt-1">General Consult � Video</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 justify-end sm:w-48 shrink-0">
                            <button 
                                onClick={() => setInSession(true)}
                                className="w-full py-2.5 text-sm font-bold bg-[var(--accent-teal)] text-white rounded shadow hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Join Session <ChevronRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showPostSession && (
                    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
                        <motion.div 
                            initial={{ y: 20, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                            className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] shadow-2xl p-6 w-full max-w-2xl border border-[var(--border-color)]"
                        >
                            <form onSubmit={handleSubmit(onSubmitSummary)}>
                                <h2 className="text-xl font-bold font-serif mb-4 flex items-center justify-between">
                                    Post-Session Summary 
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Session Completed</span>
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Clinical Notes (Required)</label>
                                        <textarea {...register("notes")} className={'w-full h-32 bg-[var(--bg-base)] border border-slate-200 rounded p-3 text-sm focus:border-[var(--accent-teal)] outline-none'}></textarea>
                                        {errors.notes && <span className="text-xs text-red-500 mt-1 block">{errors.notes.message}</span>}
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 font-bold text-sm bg-[var(--accent-teal)] text-white rounded hover:bg-teal-700 shadow-sm flex items-center gap-2">
                                        {isSubmitting ? <Activity className="animate-spin w-4 h-4" /> : 'Save & Close'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}





