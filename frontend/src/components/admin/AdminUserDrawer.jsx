import React, { useState, useEffect } from 'react';
// Clinical High-Fidelity Sync: Admin User Audit Core
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
    X, 
    Shield,
    Pulse, 
    Trash, 
    Power, 
    Phone, 
    MapPin, 
    Stethoscope,
    Pill,
    ClockCounterClockwise,
    DownloadSimple
} from '@phosphor-icons/react';
import { medicalHistoryApi, prescriptionApi } from '../../lib/api';

const AdminUserDrawer = ({ isOpen, onClose, user, profile, onToggleStatus, onDelete, processingId }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [history, setHistory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const isDoctor = user?.role === 'DOCTOR';
    const isActive = user?.status === 'ACTIVE';
    const profileId = profile?.id;

    const fetchClinicalData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [historyRes, prescriptionRes] = await Promise.allSettled([
                medicalHistoryApi.get(`/patient/user/${user?.id}`),
                profileId ? prescriptionApi.get(`/patient/${profileId}`) : Promise.reject('No profile')
            ]);

            if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data?.data || []);
            if (prescriptionRes.status === 'fulfilled') setPrescriptions(prescriptionRes.value.data || []);
        } catch (err) {
            console.error('Failed to sync clinical shards', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, profileId]);

    useEffect(() => {
        if (isOpen && user && !isDoctor) {
            fetchClinicalData();
        }
        if (!isOpen) { 
            setActiveTab('overview');
            setHistory([]);
            setPrescriptions([]);
        }
    }, [isOpen, user, isDoctor, fetchClinicalData]);

    if (!user) return null;

    const tabs = isDoctor ? ['overview', 'registry'] : ['overview', 'history', 'prescriptions'];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-[70] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex flex-col gap-6 bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Executive Record Audit</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">
                                        Clinical Ingress Platform | Auth Cluster 0.2
                                    </p>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                                    <X size={20} weight="light" />
                                </button>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-fit">
                                {tabs.map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'overview' && (
                                <div className="p-8 space-y-8">
                                    {/* Identity Shard */}
                                    <div className="flex items-start gap-6">
                                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-opacity-10 
                                            ${isDoctor ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' : 'bg-indigo-50 text-indigo-600 shadow-indigo-100'}`}>
                                            <Image 
                                                src={profile?.profileImageUrl || user?.profileImageUrl || user?.profilePic || profile?.profilePic || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=${isDoctor ? '0ea5e9' : '6366f1'}&color=fff&bold=true`} 
                                                className="w-full h-full rounded-3xl object-cover" 
                                                alt="avatar" 
                                                width={80}
                                                height={80}
                                                unoptimized
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{user.firstName} {user.lastName}</h4>
                                            <div className="flex items-center gap-2 pt-1">
                                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isActive ? 'Account Active' : 'Account Suspended'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase">Core ID: 0x{user.id?.toString().padStart(6, '0')} | {user.email}</p>
                                        </div>
                                    </div>

                                    {/* Contact Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                            <Phone size={14} weight="light" className="text-slate-300" />
                                            <p className="text-[11px] font-bold text-slate-600">{user.phone || profile?.phone || 'NO LINK'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                            <MapPin size={14} weight="light" className="text-slate-300" />
                                            <p className="text-[11px] font-bold text-slate-600 truncate">{profile?.address || 'UNSYNC ADDRESS'}</p>
                                        </div>
                                    </div>

                                    {/* Profiles */}
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Clinical Telemetry</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            {isDoctor ? (
                                                <>
                                            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                                                <Stethoscope size={14} weight="light" className="text-teal-600 mb-2" />
                                                <p className="text-[10px] font-bold text-teal-600/60 uppercase">Specialization</p>
                                                <p className="text-sm font-bold text-teal-900">{profile?.specialization || 'General Consultation'}</p>
                                            </div>
                                                    <div className="p-4 rounded-2xl bg-slate-900 p-4 text-white">
                                                        <p className="text-[9px] font-bold text-white/40 uppercase">License Matrix</p>
                                                        <p className="text-md font-bold mt-1 font-mono">{profile?.licenseNumber || 'LIC-4892-0X'}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                                <Pulse size={14} weight="light" className="text-indigo-600 mb-2" />
                                                <p className="text-[10px] font-bold text-indigo-600/60 uppercase">Gender Identity</p>
                                                <p className="text-sm font-bold text-indigo-900">{profile?.gender || 'NOT_DECLARED'}</p>
                                            </div>
                                                    <div className="p-4 rounded-2xl bg-slate-900 p-4 text-white">
                                                        <p className="text-[9px] font-bold text-white/40 uppercase">E-Patient Code</p>
                                                        <p className="text-md font-bold mt-1 font-mono">PAT-{profile?.id || 'UNSYNC'}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase">Longitudinal Medical History</h4>
                                        <ClockCounterClockwise size={14} weight="light" className="text-slate-300" />
                                    </div>
                                    {loading ? (
                                        <div className="h-32 flex items-center justify-center"><p className="text-[10px] font-bold uppercase text-slate-400 animate-pulse">Syncing Longitudinal Records...</p></div>
                                    ) : history.length === 0 ? (
                                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center"><p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Zero Clinical Shards Found</p></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.map((record) => (
                                                <div key={record.id} className="p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all bg-white shadow-sm">
                                                    <div className="flex justify-between mb-2">
                                                        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-tighter">{record.diagnosis || 'General Observation'}</p>
                                                        <p className="text-[10px] tabular-nums font-mono text-slate-400">{record.recordedAt?.split('T')[0]}</p>
                                                    </div>
                                                    <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{record.treatment || record.description}</p>
                                                    {record.notes && <p className="mt-3 p-3 bg-slate-50 rounded-xl text-[10px] italic text-slate-500 border-l-4 border-indigo-500">Note: {record.notes}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'prescriptions' && (
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase">Pharmaceutical Audit Ledger</h4>
                                        <Pill size={14} weight="light" className="text-slate-300" />
                                    </div>
                                    {loading ? (
                                        <div className="h-32 flex items-center justify-center"><p className="text-[10px] font-bold uppercase text-slate-400 animate-pulse">Scanning Global Pharmacy Pipeline...</p></div>
                                    ) : prescriptions.length === 0 ? (
                                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center"><p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Active Prescriptions Found</p></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {prescriptions.map((px) => (
                                                <div key={px.id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all bg-white shadow-sm">
                                                    <div className="flex justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <p className="text-[11px] font-bold text-slate-900">Rx ID #{px.id}</p>
                                                        </div>
                                                        <button className="text-emerald-600 hover:text-emerald-700 transition-all"><DownloadSimple size={14} weight="light" /></button>
                                                    </div>
                                                    <div className="space-y-2 mb-4">
                                                        {px.medications?.map((med, i) => (
                                                            <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                                                <p className="text-xs font-bold text-slate-700">{med.medicineName}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase">{med.dosage}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-50 flex justify-between">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Validated By Doctor ID {px.doctorId}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{px.prescribedDate}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'registry' && (
                                <div className="p-8 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase">Clinical Credentials Matrix</h4>
                                        <Shield size={16} weight="light" className="text-emerald-600" />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical License</p>
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase">Verified</span>
                                            </div>
                                            <p className="text-xl font-mono font-bold text-slate-900 tracking-tighter">{profile?.licenseNumber || 'LIC-0000-SYNAP'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 rounded-3xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Domain</p>
                                                <p className="text-xs font-bold text-slate-800">{profile?.specialization || 'General Consultation'}</p>
                                            </div>
                                            <div className="p-5 rounded-3xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Experience</p>
                                                <p className="text-xs font-bold text-slate-800">{profile?.experienceYears || '0'} Years</p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl border border-slate-100 space-y-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practitioner Biography</p>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {profile?.bio || 'Clinical profile biography is currently pending system synchronization.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/20 flex flex-col gap-3">
                            <button 
                                onClick={() => onToggleStatus(user.id)}
                                disabled={processingId === user.id}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-all
                                    ${isActive 
                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                                <Power size={14} weight="light" />
                                {processingId === user.id ? 'Processing...' : (isActive ? 'Disable Record Access' : 'Restore System Access')}
                            </button>

                            <button 
                                onClick={() => onDelete(user.id)}
                                disabled={processingId === user.id}
                                className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-300 hover:text-rose-600 transition-all flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest"
                            >
                                <Trash size={14} weight="light" />
                                Erase Account Metadata
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AdminUserDrawer;
