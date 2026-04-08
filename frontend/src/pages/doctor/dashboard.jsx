import React, { useEffect, useState } from 'react';
import { 
    Users, Calendar, ClipboardList, 
    Video, Activity, CheckCircle, Clock
} from 'lucide-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import { AnimatePresence } from 'framer-motion';
import { isToday, startOfWeek, addDays, format, isSameDay } from 'date-fns';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';
import { isDoctorApproved } from '@/lib/doctorVerification';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Badge = ({ children, variant }) => {
    const variants = {
        success: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50',
        primary: 'bg-teal-100/50 text-teal-700 border-teal-200/50',
        warning: 'bg-amber-100/50 text-amber-700 border-amber-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant] || variants.primary}`}>
            {children}
        </span>
    );
};

const DoctorDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointmentsToday: 0, activePatients: 0, hours: 8 });
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activePostSession, setActivePostSession] = useState(null);
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
                    if (profileRes?.data?.specialization) {
                        localStorage.setItem('user_specialization', profileRes.data.specialization);
                    }
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }

                    const doctorId = profileRes?.data?.id;
                    if (!doctorId) {
                        console.error("No clinical ID found for doctor profile");
                        setLoading(false);
                        return;
                    }

                    const apptRes = await appointmentApi.get(`/doctor/${doctorId}`);
                    const allAppts = apptRes.data?.data || apptRes.data || [];
                    const safeAppts = Array.isArray(allAppts) ? allAppts : [];
                    
                    setAppointments(safeAppts.filter(a => a.status !== 'CANCELLED'));
                    setStats(prev => ({
                        ...prev,
                        appointmentsToday: safeAppts.filter(a => a.status === 'PAID' && a.date && isToday(new Date(a.date))).length,
                        activePatients: new Set(safeAppts.map(a => a.patientId)).size
                    }));
                } catch (err) {
                    console.error("Failed to fetch doctor dashboard", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                <div className="text-xl font-serif text-slate-700 tracking-wide">Synthesizing Clinic View...</div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head>
                <title>{userData?.name ? `Dr. ${userData.name} | Practitioner Dashboard` : 'Doctor Dashboard'} | SynapsCare</title>
            </Head>
            
            <main className="relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-serif text-slate-900 tracking-tight text-center lg:text-left">Clinical Overview</h2>
                        <p className="text-slate-500 font-medium mt-1">Status and performance at a glance.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-8">
                                <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-3xl p-8 flex justify-between items-center relative overflow-hidden shadow-sm border border-slate-100">
                                    <div className="z-10">
                                        <h2 className="text-3xl font-serif text-teal-900 mb-2">Good Morning, {userData?.name || 'Practitioner'}</h2>
                                        <p className="text-teal-700/80 font-medium tracking-wide">Ready for your clinical rotation today.</p>
                                    </div>
                                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-90 h-[120%] flex items-end">
                                        <div className="w-48 h-48 bg-teal-200/40 rounded-full blur-3xl absolute -right-10 -bottom-10"></div>
                                        <div className="relative flex items-center gap-4 px-12 pb-4">
                                            <div className="w-16 h-32 bg-teal-600/10 rounded-t-full"></div>
                                            <div className="w-20 h-40 bg-indigo-600/10 rounded-t-full"></div>
                                            <div className="w-16 h-32 bg-teal-600/10 rounded-t-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-serif text-slate-800">Weekly Performance</h3>
                                        <button className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                            Current Rotation <Calendar className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Total Patients', value: stats.activePatients, icon: Users, bg: 'bg-teal-600', text: 'text-white', iconColor: 'text-white', iconBg: 'bg-white/20' },
                                            { label: 'Avg. Severity', value: 'Normal', icon: Activity, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
                                            { label: "Today's Visits", value: stats.appointmentsToday, icon: Calendar, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
                                            { label: 'Tele-sessions', value: appointments.filter(a => a.mode === 'TELEMEDICINE').length, icon: Video, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
                                        ].map((s, i) => (
                                            <div key={i} className={`p-6 rounded-3xl ${s.bg} flex flex-col items-center justify-center shadow-sm border border-slate-100 hover:-translate-y-1 transition-all`}>
                                                <div className={`w-12 h-12 ${s.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                                                    <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                                                </div>
                                                <div className={`text-xs font-black uppercase tracking-widest mb-1 opacity-80 ${s.text}`}>{s.label}</div>
                                                <div className={`text-3xl font-black ${s.text}`}>{s.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="surface-card bg-white overflow-hidden flex flex-col mt-8 shadow-sm border border-slate-100 rounded-[2rem]">
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                        <div>
                                            <h3 className="text-xl font-serif text-slate-900">Waitlist Queue</h3>
                                            <p className="text-xs text-slate-500 mt-1">Real-time status of awaiting patients.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors">
                                            Manage Queue
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                    <th className="p-6 pl-8">Patient Identity</th>
                                                    <th className="p-6">Visit Mode</th>
                                                    <th className="p-6">Consultation Time</th>
                                                    <th className="p-6">Clinical Status</th>
                                                    <th className="p-6 pr-8 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {appointments.filter(a => a.status !== 'PENDING').slice(0, 5).map((appt, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group cursor-pointer" onClick={() => { setSelectedAppointment(appt); setIsDrawerOpen(true); }}>
                                                        <td className="p-6 pl-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                                                                    <img src={`https://ui-avatars.com/api/?name=P${appt.patientId}&background=random&color=fff`} alt="P" />
                                                                </div>
                                                                <span className="font-bold text-slate-800">Patient #{appt.patientId}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <Badge variant={appt.mode === 'TELEMEDICINE' ? 'primary' : 'success'}>
                                                                {appt.mode}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-700">{appt.date}</span>
                                                                <span className="text-[10px] font-medium text-slate-500 mt-0.5">{appt.time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${appt.status === 'PAID' ? 'bg-teal-500' : 'bg-amber-500'} animate-pulse`} />
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{appt.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 pr-8 text-right">
                                                            {(appt.status === 'CONFIRMED' || appt.status === 'PAID') && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); setActivePostSession(appt); }}
                                                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all ml-auto group-hover:shadow-lg group-hover:shadow-teal-500/20"
                                                                    title="Issue Prescription"
                                                                >
                                                                    <ClipboardList className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {appointments.filter(a => a.status !== 'PENDING').length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="p-12 text-center">
                                                            <div className="flex flex-col items-center opacity-40">
                                                                <Calendar size={48} className="text-slate-200 mb-4" />
                                                                <p className="text-sm font-medium text-slate-400">No active sessions in queue.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                             <div className="flex justify-between items-center mb-8">
                                 <h4 className="font-serif text-slate-900 text-xl">Clinic Calendar</h4>
                                 <div className="flex gap-2">
                                     <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 rounded-lg">{format(new Date(), 'MMM')}</button>
                                 </div>
                             </div>
                             <div className="flex justify-between text-center pb-6">
                                 {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                                     const dayDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                                     const isCurrentDay = isSameDay(dayDate, new Date());
                                     return (
                                         <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isCurrentDay ? 'bg-teal-600 text-white shadow-xl shadow-teal-500/30 scale-110' : 'text-slate-400 hover:bg-slate-50'}`}>
                                             <span className="text-[9px] font-black uppercase tracking-widest">{format(dayDate, 'EEE')}</span>
                                             <span className={`text-sm font-black ${isCurrentDay ? 'text-white' : 'text-slate-800'}`}>{format(dayDate, 'd')}</span>
                                         </div>
                                     );
                                 })}
                             </div>
                             <div className="border-t border-slate-50 pt-8">
                                 <h4 className="font-serif text-slate-900 text-lg mb-6">System Health</h4>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 bg-teal-50/50 rounded-[1.5rem] border border-teal-100/30 text-center group hover:bg-teal-50 transition-colors">
                                         <div className="w-10 h-10 mx-auto bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm text-teal-500">
                                             <CheckCircle size={18} />
                                         </div>
                                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
                                         <div className="text-sm font-black text-teal-700">92%</div>
                                     </div>
                                     <div className="p-4 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100/30 text-center group hover:bg-indigo-50 transition-colors">
                                         <div className="w-10 h-10 mx-auto bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm text-indigo-500">
                                             <Clock size={18} />
                                         </div>
                                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hours</div>
                                         <div className="text-sm font-black text-indigo-700">8.5</div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-[50px] rounded-full" />
                            <h4 className="font-serif text-xl mb-8 relative z-10">Patient Flow Tracker</h4>
                            <div className="h-40 flex items-end justify-between gap-2 px-2 relative z-10">
                                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                                    const dayDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                                    const dayAppointments = appointments.filter(a => a.date && isSameDay(new Date(a.date), dayDate)).length;
                                    const h = dayAppointments > 0 ? Math.min(100, Math.max(10, dayAppointments * 20)) : 10 + (i * 15 % 50); 
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="flex items-end gap-1.5 h-28">
                                                <div className="w-2.5 bg-white/10 rounded-t-full transition-all duration-700" style={{ height: `${h}%` }}></div>
                                                <div className="w-2.5 bg-teal-400 rounded-t-full shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all duration-1000 delay-100" style={{ height: `${h * 0.7}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                                {format(dayDate, 'EEE')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
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
            </main>
        </DashboardLayout>
    );
};

export default DoctorDashboard;
