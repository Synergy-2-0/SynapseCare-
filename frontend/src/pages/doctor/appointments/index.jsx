import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';       
import Header from '../../../components/layout/Header';
import AppointmentCard from '../../../components/doctor/AppointmentCard';       
import { Search, Calendar as CalendarIcon, Filter, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockDataContext } from '../../../context/MockDataContext';
import { doctorApi } from '../../../lib/api';
import { isDoctorApproved } from '../../../lib/doctorVerification';

const TABS = ['All', 'Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];

export default function DoctorAppointments() {
    const router = useRouter();
    const { appointments, isLoading, updateAppointmentStatus } = useContext(MockDataContext);
    const [activeTab, setActiveTab] = useState('Pending');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        return appointments.filter(appt => {
            if (activeTab !== 'All' && appt.status.toUpperCase() !== activeTab.toUpperCase()) return false;
            if (searchQuery && !appt.patient.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [appointments, activeTab, searchQuery]);

    useEffect(() => {
        let mounted = true;

        const validateAccess = async () => {
            try {
                const res = await doctorApi.get('/profile/me');
                if (mounted && !isDoctorApproved(res?.data?.verificationStatus)) {
                    router.replace('/doctor/setup');
                }
            } catch {
                if (mounted) {
                    router.replace('/doctor/setup');
                }
            }
        };

        validateAccess();
        return () => {
            mounted = false;
        };
    }, [router]);

    if (isLoading && appointments.length === 0) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6 mt-8">
                    <div className="h-10 bg-[var(--bg-base)] w-1/4 rounded mb-6"></div>
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--bg-card)] rounded-lg"></div>)}
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <Header title="Appointments" subtitle="Manage your patient consultations" />

            <div className="mt-8 space-y-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-[var(--border-color)]/50 overflow-x-auto custom-scrollbar pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-[15px] font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-[var(--accent-teal)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="appt-tab" className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[var(--accent-teal)] rounded-t-full shadow-[0_0_8px_rgba(13,148,136,0.5)]" />  
                            )}
                        </button>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 glass-morphism p-3 !rounded-[var(--radius-3xl)] shadow-sm sticky top-24 z-30">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-[20px] h-[20px] group-focus-within:text-[var(--accent-teal)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patient name..."
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-2xl)] focus:outline-none focus:border-[var(--accent-teal)] focus:ring-4 focus:ring-[var(--accent-teal)]/10 text-[var(--text-primary)] text-[15px] font-medium transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}    
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? filtered.map((appt, i) => (
                            <motion.div 
                                key={appt.id} 
                                initial={{ opacity: 0, y: 15 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.01, y: -2 }}
                                className="surface-card surface-card-hover p-6 !rounded-[var(--radius-2xl)] border border-[var(--border-color)]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center font-black text-indigo-400 text-xl">
                                        {appt.patient.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-[var(--text-primary)] hover:text-[var(--accent-teal)] transition-colors font-serif">{appt.patient}</h4>
                                        <p className="text-[15px] text-[var(--text-muted)] font-medium mt-1 flex items-center gap-2">
                                            <CalendarIcon size={14} className="text-slate-400" /> {appt.time} • {appt.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border shadow-sm ${appt.status === 'Confirmed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : appt.status === 'Pending' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>{appt.status}</span>
                                    {appt.status === 'Pending' && (
                                        <button onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(appt.id, 'Confirmed'); }} className="btn-primary !py-2 !px-4 !text-sm">Confirm Slot</button>
                                    )}
                                </div>
                            </motion.div>
                        )) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 surface-card !rounded-[var(--radius-3xl)] flex flex-col items-center justify-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 border-4 border-white shadow-sm">
                                    <Layers size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-serif">No Appointments Found</h3>
                                <p className="text-[var(--text-muted)] text-[15px] mt-2 font-medium max-w-md mx-auto">Zero {activeTab.toLowerCase()} sessions matched your current filters. Adjust your search or check a different tab.</p>  
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
