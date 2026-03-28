import React, { useEffect, useState } from 'react';
import { 
    LayoutDashboard, Users, Calendar, ClipboardList, 
    Video, LogOut, Search, Bell, CheckCircle, XCircle,
    Activity, Shield, AlertCircle, ArrowUpRight, Stethoscope, Clock
} from 'lucide-react';
import { useRouter } from 'next/router';
import { appointmentApi, prescriptionApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleTab from '@/components/doctor/ScheduleTab';
import TelemedicineTab from '@/components/doctor/TelemedicineTab';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';


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
    const [stats, setStats] = useState({ appointmentsToday: 0, activePatients: 0, hours: 0 });
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
const [activePostSession, setActivePostSession] = useState(null);
    const [prescForm, setPrescForm] = useState({ appointmentId: '', patientId: '', medicineName: '', dosage: '', duration: '', instructions: '' });
    const [submitting, setSubmitting] = useState(false);
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
                    const apptRes = await appointmentApi.get(`/doctor/${id}`);
                    const allAppts = apptRes.data?.data || [];
                    setAppointments(allAppts.filter(a => a.status !== 'CANCELLED'));
                    setStats({
                        appointmentsToday: allAppts.filter(a => a.status === 'PAID').length,
                        activePatients: 24,
                        hours: 8
                    });
                } catch (err) {
                    console.error("Failed to fetch doctor dashboard", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await prescriptionApi.post('/', {
                appointmentId: parseInt(prescForm.appointmentId),
                doctorId: parseInt(userData.id),
                patientId: parseInt(prescForm.patientId),
                medicineName: prescForm.medicineName,
                dosage: prescForm.dosage,
                duration: prescForm.duration,
                instructions: prescForm.instructions,
                issuedDate: new Date().toISOString().split('T')[0]
            });
            toast.success("Prescription issued beautifully!");
            setActiveTab('overview');
            setPrescForm({ appointmentId: '', patientId: '', medicineName: '', dosage: '', duration: '', instructions: '' });
        } catch (err) {
            toast.error("Failed to issue. Please review details.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApptAction = async (id, action) => {
        try {
            await appointmentApi.put(`/${id}/${action}`);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: action === 'accept' ? 'CONFIRMED' : 'REJECTED' } : a));
            toast.success(`Visit ${action === 'accept' ? 'Confirmed' : 'Rejected'}`);
        } catch (err) {
            console.error("Action error", err);
            toast.error("Failed to update status");
        }
    };

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                <div className="text-xl font-serif text-slate-700 tracking-wide">Synthesizing Clinic View...</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex">
            <aside className="w-80 glass-morphism border-r border-[var(--border-color)] flex flex-col p-8 sticky top-0 h-screen z-10">
                <div className="inline-flex items-center gap-2 mb-16 px-2 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img src="/logo.png" alt="SynapCare" className="w-10 h-10 object-contain relative drop-shadow-sm transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
                        Synap<span className="text-indigo-600">Care</span>
                    </span>
                </div>
                
                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'patients', icon: Users, label: 'My Patients' },
                        { id: 'schedule', icon: Calendar, label: 'My Schedule' },
                        { id: 'telemedicine', icon: Video, label: 'Telemedicine' },
                    ].map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id)} 
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[var(--radius-xl)] transition-all duration-300 font-medium ${
                                activeTab === item.id 
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 translate-x-1' 
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-[var(--border-color)]">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-[var(--radius-xl)] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                        <span className="text-sm tracking-wide">End Session</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-10 xl:p-14 overflow-y-auto w-full relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

                <header className="flex justify-between items-end mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl xl:text-5xl font-serif text-slate-900 tracking-tight">Good morning, Dr. {userData?.name?.split(' ')[0] || 'Doctor'}</h1>
                            <div className="px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-full border border-emerald-200/50 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                Verified
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium text-sm tracking-widest pl-1 uppercase opacity-80">Medical Practitioner ID: #DOC-{userData?.id}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-teal-600 shadow-sm border border-[var(--border-color)] transition-all hover:shadow-md">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-teal-600 shadow-sm border border-[var(--border-color)] transition-all hover:shadow-md relative">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
                        </button>
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <img src={`https://ui-avatars.com/api/?name=${userData?.name}&background=0D8B93&color=fff`} alt="Profile" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-8">
                          
                          {activeTab === 'overview' && (
                              <>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                      {[
                                          { label: 'Active Clinic Queue', value: stats.appointmentsToday, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100/50' },
                                { label: 'Assigned Patients', value: stats.activePatients, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100/50' }, 
                                { label: 'Daily Hours Logged', value: `${stats.hours}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100/50' }
                            ].map((s, i) => (
                                <motion.div key={i} whileHover={{ y: -4 }} className={`surface-card p-6 border ${s.border} bg-white group flex flex-col justify-between h-[160px]`}>
                                    <div className="flex justify-between items-start">
                                        <div className={`p-4 ${s.bg} ${s.color} rounded-[1.2rem] group-hover:scale-110 transition-transform shadow-sm`}>
                                            <s.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                                        <div className="text-4xl font-serif text-slate-900">{s.value}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>


                            <div className="surface-card bg-white overflow-hidden flex flex-col min-h-[400px]">
                                <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/30">
                                    <h3 className="text-2xl font-serif text-slate-900">Today's Practice Schedule</h3>
                                    <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest flex items-center gap-1 group">
                                        View Manifest <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                                <div className="p-8 space-y-4 flex-1">
                                    {appointments.length > 0 ? appointments.map((appt, i) => (
                                        <div key={i} className="p-6 bg-slate-50/50 rounded-[var(--radius-2xl)] flex justify-between items-center border border-slate-100 group hover:border-teal-500/30 hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white border border-slate-200 text-teal-600 rounded-[1rem] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                                                    #{appt.tokenNumber || (i+1)}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-serif text-slate-900 font-medium mb-1.5 flex items-center gap-3">
                                                        Patient Record #{appt.patientId}
                                                        {appt.status === 'PENDING' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                                                    </div>
                                                    <div className="flex gap-3 items-center">
                                                        <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'PAID' ? 'primary' : 'warning'}>{appt.status}</Badge>
                                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{appt.date} • {appt.time}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 items-center">
                                                {appt.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); handleApptAction(appt.id, 'accept'); }} className="w-10 h-10 flex items-center justify-center bg-white border border-emerald-200 text-emerald-600 rounded-full shadow-sm hover:bg-emerald-50 hover:scale-105 transition-all" title="Accept Visit">
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleApptAction(appt.id, 'reject'); }} className="w-10 h-10 flex items-center justify-center bg-white border border-rose-200 text-rose-600 rounded-full shadow-sm hover:bg-rose-50 hover:scale-105 transition-all" title="Reject Visit">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {(appt.status === 'CONFIRMED' || appt.status === 'PAID') && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setActivePostSession(appt); }}
                                                        className="px-5 py-2.5 bg-teal-600 text-white rounded-[1rem] text-sm font-semibold flex items-center gap-2 hover:bg-teal-700 hover:shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                                                    >
                                                        <ClipboardList className="w-4 h-4" /> Issue Rx
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                <Calendar className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <div className="text-lg font-serif text-slate-500 mb-2">No active appointments</div>
                                            <p className="text-sm font-medium opacity-70">Your schedule for off-hours is currently clear.</p>
                                        </div>
                                    )}
                                </div>
                            </div>                              </>                        )}

                        {activeTab === 'patients' && (
                            <div className="surface-card bg-white overflow-hidden flex flex-col min-h-[400px]">
                                <div className="p-8 border-b border-[var(--border-color)] bg-slate-50/30">
                                    <h3 className="text-2xl font-serif text-slate-900">Patient Roster</h3>
                                    <p className="text-slate-500 font-medium mt-2">Manage your clinical patient histories</p>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500">
                                                <th className="p-6 font-semibold">ID</th>
                                                <th className="p-6 font-semibold">Patient Name</th>
                                                <th className="p-6 font-semibold">Age</th>
                                                <th className="p-6 font-semibold">Last Visit</th>
                                                <th className="p-6 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[ {id: 101, name: 'Sarah Jenkins', age: 34, lastVisit: '2023-10-14', status: 'Active'}, {id: 204, name: 'Marcus Reed', age: 45, lastVisit: '2023-10-22', status: 'Monitoring'}, {id: 308, name: 'Eleanor Vance', age: 62, lastVisit: '2023-11-05', status: 'Active'}, {id: 412, name: 'James Holden', age: 28, lastVisit: '2023-11-12', status: 'Discharged'} ].map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                                    <td className="p-6 font-medium text-slate-500">#{p.id}</td>
                                                    <td className="p-6 font-serif text-slate-900 font-medium text-lg flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">{p.name.charAt(0)}</div>{p.name}</td>
                                                    <td className="p-6 text-slate-600">{p.age} yrs</td>
                                                    <td className="p-6 text-slate-600">{p.lastVisit}</td>
                                                    <td className="p-6">
                                                        <span className={{'Active': 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700', 'Monitoring': 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700', 'Discharged': 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600'}[p.status] || 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600'}>{p.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <ScheduleTab appointments={appointments} />
                        )}

                        {activeTab === 'telemedicine' && (
                            <TelemedicineTab appointments={appointments} userData={userData} onCompleteSession={(id) => {
                                // optional reload or optimistic update here
                                setAppointments(prev => prev.filter(a => a.id !== id));
                            }} onEndSession={(appt, notes) => setActivePostSession({ ...appt, inheritedNotes: notes })} />
                        )}
                        
                    </div>

                    <div className="space-y-8">
                        {activeTab === 'overview' && (
                            <>
                                <div className="glass-morphism bg-gradient-to-b from-indigo-900 to-slate-900 rounded-[var(--radius-3xl)] p-8 text-white relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
                                     <h4 className="text-xl font-serif mb-6 relative z-10">Active Shift Hours</h4>
                                     <div className="space-y-4 relative z-10">
                                        {['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'].map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-medium text-indigo-100 bg-white/5 p-3 rounded-[1rem] border border-white/5">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div> {s}
                                            </div>
                                        ))}
                                        <button className="w-full py-3.5 bg-white text-indigo-900 rounded-[1rem] font-semibold text-xs tracking-widest uppercase shadow-lg shadow-white/10 mt-6 hover:bg-slate-50 transition-colors active:scale-95">Modify Shift</button>
                                     </div>
                                </div>


                            </>
                        )}

                        {activeTab === 'patients' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Patient Roster Insights</h4>
                                <p className="text-slate-500 text-sm">Dynamic analytics for your patient base in this panel.</p>
                                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                                    <li>• Active cases: {appointments.filter(a => a.status !== 'CANCELLED').length}</li>
                                    <li>• High-risk referrals: 5</li>
                                    <li>• Pending lab review: 2</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Schedule Summary</h4>
                                <p className="text-slate-500 text-sm">Only today & tomorrow appointments shown below.</p>
                                <div className="mt-4 space-y-3">
                                    {appointments.slice(0, 4).map((appt, i) => (
                                        <div key={i} className="flex justify-between p-3 rounded-lg border border-slate-100">
                                            <span className="text-sm text-slate-600">#{appt.patientId}</span>
                                            <span className="text-sm text-slate-600">{appt.time}</span>
                                            <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'PAID' ? 'primary' : 'warning'}>{appt.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'telemedicine' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Telemedicine Panel</h4>
                                <p className="text-slate-500 text-sm">This area shows active remote consultation tokens and immediate post-session Rx handoff.</p>
                                <div className="mt-4 space-y-3">
                                    {appointments.filter(a => a.mode === 'TELEMEDICINE' || a.type === 'TELEMEDICINE').slice(0, 4).map((appt, i) => (
                                        <div key={i} className="p-3 rounded-lg border border-slate-100">
                                            <div className="text-sm font-medium text-slate-700">Patient #{appt.patientId}</div>
                                            <div className="text-xs text-slate-500">{appt.date} • {appt.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <PatientContextDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} appointment={selectedAppointment} />
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
        </div>
    );
};

export default DoctorDashboard;













