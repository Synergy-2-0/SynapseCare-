import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, Activity, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentApi } from '@/lib/api';
import toast from 'react-hot-toast';

const PatientRosterTab = ({ userData, onViewPatient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        if (!userData?.id) return;
        const fetchPatients = async () => {
            try {
                const res = await appointmentApi.get(`/doctor/${userData.id}/patients`);
                setPatients(res.data?.data || []);
            } catch (err) {
                console.error('Failure fetching roster:', err);
                toast.error("Could not load patient roster.");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [userData]);

    const filteredPatients = patients.filter(p => {
        if(!p) return false;
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.id?.toString().includes(searchTerm);
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex h-[700px] items-center justify-center bg-white border border-slate-200">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="surface-card bg-white min-h-[700px] flex flex-col border border-slate-200">
            {/* Header & Controls */}
            <div className="p-8 border-b border-[var(--border-color)] bg-slate-50/50 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                <div>
                    <h3 className="text-2xl font-serif text-slate-900">Patient Directory</h3>
                    <p className="text-slate-500 font-medium mt-1">Manage and review your complete clinical patient base.</p>
                </div>
                
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by ID or Patient Name..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm text-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* Roster Grid */}
            <div className="p-8 flex-1 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredPatients.map((p, i) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                key={p.id}
                                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all group flex flex-col cursor-pointer"
                                onClick={() => onViewPatient && onViewPatient(p)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100 group-hover:scale-110 transition-transform">
                                            {p.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-slate-900 text-lg">{p.name}</h4>
                                            <p className="text-xs font-medium text-slate-400">ID: #{p.id} • {p.gender || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Assigned
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone || 'No Contact'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Activity className="w-3.5 h-3.5 text-slate-400" /> Blood Group: {p.bloodGroup || 'N/A'}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between group-hover:border-teal-100 transition-colors">
                                    <div className="text-teal-600 flex items-center text-xs font-bold gap-1 transform translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-auto">
                                        View Dashboard <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredPatients.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
                            <Users className="w-10 h-10 mb-4 opacity-50" />
                            <p className="text-lg font-serif">No patients found</p>
                            <p className="text-sm font-medium">Your roster is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientRosterTab;