import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import { CheckCircle, XCircle, Calendar, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';

const Badge = ({ children, variant }) => {
    const variants = {
        success: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50',
        primary: 'bg-teal-100/50 text-teal-700 border-teal-200/50',
        warning: 'bg-amber-100/50 text-amber-700 border-amber-200/50',
        danger: 'bg-rose-100/50 text-rose-700 border-rose-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${variants[variant] || variants.primary}`}>
            {children}
        </span>
    );
};

const getStatusPillClass = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT':
        case 'PENDING':
            return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'CONFIRMED':
        case 'PAID':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'IN_PROGRESS':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'COMPLETED':
            return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'MISSED':
        case 'CANCELLED':
        case 'REJECTED':
            return 'bg-rose-100 text-rose-800 border-rose-200';
        case 'BLOCKED':
            return 'bg-slate-800 text-white border-slate-900';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activePostSession, setActivePostSession] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL and individual statuses
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');
            const name = localStorage.getItem('user_name');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            setUserData({ name, id });

            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }

                    const apptRes = await appointmentApi.get(`/doctor/${id}`);
                    const allAppts = apptRes.data?.data || apptRes.data || [];
                    setAppointments(Array.isArray(allAppts) ? allAppts : []);
                } catch (error) {
                    console.error("Failed to fetch appointments", error);
                    toast.error("Could not load clinical roster");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const handleApptAction = async (id, action) => {
        try {
            await appointmentApi.put(`/${id}/${action}`);
            setAppointments(prev => prev.map(a => 
                a.id === id ? { ...a, status: action === 'accept' ? 'CONFIRMED' : 'REJECTED' } : a
            ));
            toast.success(`Visit ${action === 'accept' ? 'confirmed' : 'rejected'}`);
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Protocol update failed");
        }
    };

    const filteredAppointments = appointments.filter(a => {
        if (filter === 'ALL') return true;
        return a.status === filter;
    });

    if (loading) return (
        <DashboardLayout>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <Head>
                <title>Clinical Roster | SynapsCare Doctor Project</title>
            </Head>

            <div className="relative">
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/10 blur-[80px] -z-10 rounded-full"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-3xl font-serif text-slate-900 tracking-tight">Clinical Roster</h2>
                        <p className="text-slate-500 font-medium mt-1">Unified view of your patient consultations and visit protocols.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end lg:self-center">
                        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                            {['ALL', 'PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'PAID', 'COMPLETED', 'MISSED', 'CANCELLED', 'REJECTED', 'BLOCKED'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filter === f ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="surface-card bg-white overflow-hidden shadow-sm border border-slate-100 rounded-[2rem]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                    <th className="p-8 pl-10">Patient Identity</th>
                                    <th className="p-8">Visit Mode</th>
                                    <th className="p-8">Consultation Timeline</th>
                                    <th className="p-8">Protocol Status</th>
                                    <th className="p-8 pr-10 text-right">Operational Interface</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((appt) => (
                                        <tr 
                                            key={appt.id} 
                                            className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                                            onClick={() => { setSelectedAppointment(appt); setIsDrawerOpen(true); }}
                                        >
                                            <td className="p-8 pl-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border border-white">
                                                        <img src={`https://ui-avatars.com/api/?name=P${appt.patientId}&background=random&color=fff`} alt="P" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base">Patient #{appt.patientId}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">UID: {appt.patientId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <Badge variant={appt.mode === 'TELEMEDICINE' ? 'primary' : 'success'}>
                                                    {appt.mode}
                                                </Badge>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{appt.date}</span>
                                                    <span className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-teal-500" /> {appt.time}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        appt.status === 'PAID' ? 'bg-blue-500' : 
                                                        appt.status === 'CONFIRMED' ? 'bg-emerald-500' : 
                                                        appt.status === 'IN_PROGRESS' ? 'bg-green-500 animate-pulse' :
                                                        appt.status === 'COMPLETED' ? 'bg-gray-400' :
                                                        appt.status === 'BLOCKED' ? 'bg-slate-700' :
                                                        appt.status === 'MISSED' || appt.status === 'CANCELLED' || appt.status === 'REJECTED' ? 'bg-rose-500' :
                                                        'bg-amber-500 animate-pulse'
                                                    }`} />
                                                    <span className={`text-[11px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full ${getStatusPillClass(appt.status)}`}>{appt.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 pr-10 text-right">
                                                <div className="flex justify-end gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                                    {appt.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApptAction(appt.id, 'accept')}
                                                                className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                title="Accept Protocol"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleApptAction(appt.id, 'reject')}
                                                                className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                                title="Reject Protocol"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(appt.status === 'CONFIRMED' || appt.status === 'PAID' || appt.status === 'IN_PROGRESS') && (
                                                        <button 
                                                            onClick={() => setActivePostSession(appt)}
                                                            className="px-4 h-10 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal-600 hover:text-white transition-all hover:shadow-lg hover:shadow-teal-500/20"
                                                        >
                                                            <ClipboardList size={16} /> Finish Visit
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-24 text-center">
                                            <div className="flex flex-col items-center opacity-40">
                                                <Calendar size={64} className="text-slate-200 mb-6" />
                                                <p className="text-lg font-serif text-slate-400">No matching clinical entries discovered.</p>
                                                <p className="text-xs text-slate-400 mt-2">Adjust your filtering protocols to view more.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PatientContextDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                appointment={selectedAppointment} 
            />

            <AnimatePresence>
                {activePostSession && (
                    <SessionPrescriptionModal 
                        session={activePostSession} 
                        onClose={() => setActivePostSession(null)} 
                        doctorId={userData?.id} 
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default AppointmentsPage;
