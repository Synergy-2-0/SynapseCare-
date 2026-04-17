import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Save, Clock, Stethoscope, AlertCircle, FileText, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi, medicalHistoryApi } from '@/lib/api';

const EncounterWorkspace = ({ session, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [clinicalNote, setClinicalNote] = useState('');

    if (!session) return null;

    const handleCompleteEncounter = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // 1. Save Clinical Note / Diagnosis to Medical History if provided
            if (diagnosis.trim() || clinicalNote.trim()) {
                await medicalHistoryApi.post('/', {
                    patientId: parseInt(session.patientId || 0),
                    condition: diagnosis || 'General Consultation',
                    diagnosisDate: new Date().toISOString().split('T')[0],
                    treatment: 'Session Record - Signed',
                    notes: clinicalNote
                });
            }

            // 3. Sign chart and complete (only if not already completed)
            if (session.status !== 'COMPLETED') {
                await appointmentApi.patch(`/${session.id}/status?status=COMPLETED`);
            }

            toast.success("Encounter signed and chart closed.");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to sign encounter.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
            >
                {/* Header Navbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-10">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center rotate-3 shadow-lg shadow-slate-200">
                                <Stethoscope size={24} />
                            </div>
                            <div>
                                <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Clinical Session</h1>
                                <p className="text-xl font-serif font-bold text-slate-900 leading-none">{session.patientName || session.name || `Patient #${session.patientId}`}</p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex gap-6">
                           <div>
                               <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Appt ID</span>
                               <span className="text-xs font-bold text-slate-600 font-mono">#{session.id}</span>
                           </div>
                           <div>
                               <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Session Timer</span>
                               <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5"><Clock size={12}/> 00:15:30</span>
                           </div>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
                        <X size={24} />
                    </button>
                </header>

                {/* Main Content Areas */}
                <main className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT PANEL: Chart Review & Vitals (300px) */}
                    <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                        <div className="p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                                <ClipboardList size={14} /> Patient Summary
                            </h3>
                            
                            <div className="space-y-4 mb-10">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Primary Vitals</span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">BP</p>
                                            <p className="text-sm font-black text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4">120/80</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Weight</p>
                                            <p className="text-sm font-black text-slate-900">75kg</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                                    <span className="text-[10px] font-black uppercase text-rose-400 block mb-2 flex items-center gap-1">
                                        <AlertCircle size={10} /> Active Allergies
                                    </span>
                                    <p className="text-xs font-black text-rose-700">Penicillin (Severe Rash)</p>
                                </div>
                            </div>

                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Past Encounter History</h3>
                            <div className="space-y-3">
                                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
                                    <span className="text-[9px] font-bold text-indigo-500 block mb-1">June 12, 2024</span>
                                    <p className="text-xs font-black text-slate-800 mb-1 leading-tight">Type 2 Diabetes Screening</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">Diagnosis confirmed. Patient advised on keto-lite diet.</p>
                                </div>
                                {session.inheritedNotes && (
                                    <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl">
                                        <span className="text-[9px] font-black text-teal-600 block mb-1 uppercase tracking-widest">Pre-Session Triage</span>
                                        <p className="text-xs font-bold text-teal-900 leading-relaxed italic">"{session.inheritedNotes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CHARTING AREA (Fill Space) */}
                    <div className="flex-1 bg-white flex flex-col p-12 overflow-y-auto custom-scrollbar">
                        <div className="max-w-4xl w-full mx-auto space-y-12">
                            <header className="space-y-2">
                                <div className="flex items-center gap-3 text-slate-900 mb-2">
                                    <FileText size={28} />
                                    <h2 className="text-3xl font-serif font-black tracking-tight underline decoration-slate-100 decoration-8 underline-offset-4">Clinical Encounter Record</h2>
                                </div>
                                <p className="text-sm text-slate-500 max-w-xl">Capture essential session details. Digital prescriptions and billing are managed separately after signing this record.</p>
                            </header>

                            <div className="space-y-10">
                                <div className="group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block group-focus-within:text-indigo-500 transition-colors">Assessment & Primary Diagnosis</label>
                                    <input 
                                        value={diagnosis} 
                                        onChange={e => setDiagnosis(e.target.value)} 
                                        placeholder="Enter the medical condition... (e.g. Acute Rhinitis, Stable Angina)" 
                                        className="w-full bg-transparent border-b-2 border-slate-100 rounded-none px-0 py-4 text-2xl font-serif font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200 text-slate-900"
                                    />
                                </div>

                                <div className="group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block group-focus-within:text-indigo-500 transition-colors">Clinical Observations & Subjective Notes</label>
                                    <textarea 
                                        value={clinicalNote} 
                                        onChange={e => setClinicalNote(e.target.value)} 
                                        placeholder="Capture the patient's narrative, examination findings, and follow-up plan. This note is your permanent legal record." 
                                        className="w-full min-h-[400px] bg-slate-50/50 border border-transparent rounded-[2rem] p-8 text-lg font-medium focus:border-slate-100 focus:bg-white outline-none transition-all resize-none text-slate-700 leading-relaxed shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer / Checkout Bar */}
                <footer className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-3 text-emerald-600 text-xs font-black uppercase tracking-widest bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Authenticated Charting Mode Active
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                            Save as Draft
                        </button>
                        <button 
                            onClick={handleCompleteEncounter} 
                            disabled={submitting} 
                            className="px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-4 disabled:opacity-50"
                        >
                            {submitting ? 'Finalizing Record...' : 'Sign & Complete Session'}
                            <Save size={18} className="text-teal-400" />
                        </button>
                    </div>
                </footer>
            </motion.div>
        </AnimatePresence>
    );
};

export default EncounterWorkspace;
