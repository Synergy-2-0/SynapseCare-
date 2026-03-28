import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { Search, Filter, X, ChevronRight, FileText, Activity, Clock, FileType2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PATIENTS = [
  { id: 'PT-1042', name: 'Kavinda Seneviratne', age: 34, bloodGroup: 'O+', contact: '+94 77 123 4567', lastVisit: '2026-03-15', condition: 'Hypertension', visits: 3 },
  { id: 'PT-1045', name: 'Amara Jayasinghe', age: 29, bloodGroup: 'A-', contact: '+94 71 987 6543', lastVisit: '2026-03-22', condition: 'Migraine', visits: 1 },
];

export default function DoctorPatients() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    const filtered = MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <DashboardLayout>
            <Header title="My Patients" subtitle="Complete patient registry and history" />
            
            <div className="mt-8">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 surface-card p-3 !rounded-[var(--radius-3xl)] mb-8">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-[20px] h-[20px] group-focus-within:text-[var(--accent-teal)] transition-colors" />
                        <input
                            type="text" 
                            placeholder="Search by name, ID, condition..."      
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-[var(--radius-2xl)] focus:outline-none focus:border-[var(--accent-teal)] focus:ring-4 focus:ring-[var(--accent-teal)]/10 text-[var(--text-primary)] text-[15px] font-medium transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}    
                        />
                    </div>
                    <button className="px-6 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-[var(--radius-2xl)] text-[var(--text-primary)] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] text-[15px] font-bold flex items-center gap-2 transition-all shadow-sm">
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {/* Patient List */}
                <div className="space-y-4">
                    {filtered.map(patient => (
                        <div key={patient.id} className="surface-card surface-card-hover p-5 !rounded-[var(--radius-2xl)] flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[var(--accent-teal)] font-black text-xl shadow-sm">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-[var(--text-primary)] font-serif group-hover:text-[var(--accent-teal)] transition-colors">{patient.name}</h4>
                                    <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] font-medium mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">#{patient.id}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        <span>Last visit: {patient.lastVisit}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        <span className="text-[var(--accent-teal)] font-bold">{patient.visits} Consultations</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPatient(patient)}
                                className="px-5 py-2.5 text-sm font-bold text-[var(--text-primary)] bg-white hover:bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl transition-all flex items-center gap-2 group-hover:border-[var(--accent-teal)] group-hover:text-[var(--accent-teal)] shadow-sm"
                </div>
            </div>

            {/* Slide-in Drawer */}
            <AnimatePresence>
                {selectedPatient && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPatient(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ x: 500, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 500, opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className="fixed top-4 right-4 bottom-4 w-full max-w-[480px] glass-morphism shadow-[var(--shadow-premium-lg)] z-50 border border-white/50 flex flex-col rounded-[var(--radius-3xl)] overflow-hidden"
                        >
                            <div className="p-8 border-b border-[var(--border-color)]/50 flex items-center justify-between bg-white/40">
                                <h2 className="text-2xl font-serif font-black text-[var(--text-primary)]">Patient Profile</h2>
                                <button onClick={() => setSelectedPatient(null)} className="p-2.5 text-[var(--text-muted)] bg-white/50 hover:bg-white rounded-full transition-all border border-transparent hover:border-[var(--border-color)] shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {/* Header Details */}
                                <div className="flex items-start gap-5">        
                                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-[var(--accent-teal)] font-black text-3xl border border-[var(--border-color)] shadow-sm">
                                        {selectedPatient.name.charAt(0)}        
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-2xl font-black font-serif text-[var(--text-primary)] leading-tight">{selectedPatient.name}</h3>
                                        <div className="text-sm font-medium text-[var(--text-muted)] mt-2 space-y-1">
                                            <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"/> Age: {selectedPatient.age} &nbsp;|&nbsp; Blood: <span className="text-red-500 font-bold">{selectedPatient.bloodGroup}</span></p>
                                            <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"/> {selectedPatient.contact}</p>    
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs for Drawer */}
                                <div className="space-y-6">
                                    <div className="surface-card !rounded-2xl overflow-hidden border-0 bg-white/60">
                                        <div className="bg-[var(--bg-card)] px-5 py-4 border-b border-[var(--border-color)] flex items-center gap-3 font-bold text-[var(--text-primary)]">
                                            <Activity size={18} className="text-[var(--accent-teal)]" /> Medical History
                                        </div>
                                        <div className="p-5 text-sm text-[var(--text-secondary)] bg-transparent leading-relaxed">
                                            Primary Condition: <span className="font-bold text-[var(--text-primary)]">{selectedPatient.condition}</span><br />
                                            <div className="border-l-2 border-[var(--accent-teal)] pl-3">
                                                <p className="font-bold text-[var(--text-primary)]">Last Visit: {selectedPatient.lastVisit}</p>
                                                <p className="text-[var(--text-muted)]">Follow-up on {selectedPatient.condition}. Vitals normal.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-base)]">
                                <button className="w-full py-3 bg-[var(--accent-teal)] hover:bg-teal-700 text-white rounded-[var(--radius-sm)] font-bold shadow-sm transition-all">
                                    Start New Consultation
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
