import React, { useEffect, useState } from 'react';
import { doctorApi, appointmentApi } from '../../lib/api';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    ClipboardList, 
    Clock, 
    Video, 
    LogOut, 
    Search, 
    Bell, 
    MoreVertical, 
    CheckCircle, 
    XCircle,
    Activity,
    Shield,
    Stethoscope,
    AlertCircle,
    FileText,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const DoctorDashboard = () => {
    const [userData] = useState(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        return {
            name: localStorage.getItem('user_name'),
            id: localStorage.getItem('user_id')
        };
    });
    const [stats, setStats] = useState({ appointmentsToday: 0, activePatients: 0, hours: 0 });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');

            if (role !== 'DOCTOR') { router.push('/login'); return; }

            const fetchData = async () => {
                try {
                    const apptRes = await appointmentApi.get(`/appointments/doctor/${id}`);
                    const allAppts = apptRes.data || [];
                    setAppointments(allAppts.filter(a => a.status !== 'CANCELLED'));
                    setStats({
                        appointmentsToday: allAppts.filter(a => a.status === 'PAID').length,
                        activePatients: 24,
                        hours: 8
                    });
                    setLoading(false);
                } catch (err) {
                    console.error("Failed to fetch doctor dashboard", err);
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black italic text-slate-900 tracking-widest text-3xl animate-pulse">Establishing Connection...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-bold italic text-slate-900 italic font-bold">
            <aside className="w-80 bg-slate-950 border-r border-white/5 flex flex-col p-10 sticky top-0 h-screen shadow-2xl italic font-bold">
                <div className="flex items-center gap-4 mb-20 px-4 italic">
                    <img src="/logo.png" alt="SynapseCare" className="w-12 h-12" />
                    <span className="text-2xl font-black text-white italic tracking-tighter italic font-bold">Doctor Portal</span>
                </div>
                
                <div className="flex-1 space-y-3 italic font-bold">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'My Practice' },
                        { id: 'patients', icon: Users, label: 'My Patients' },
                        { id: 'schedule', icon: Calendar, label: 'My Schedule' },
                        { id: 'prescriptions', icon: ClipboardList, label: 'e-Prescriptions' },
                        { id: 'telemedicine', icon: Video, label: 'Video Calls' },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] font-black scale-100 transition-all italic hover:scale-[1.02] ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <item.icon className="w-5 h-5 italic" /> {item.label}
                        </button>
                    ))}
                </div>

                <div className="pt-8 border-t border-white/5 italic">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] font-black text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all italic font-bold uppercase tracking-widest text-[10px]">
                        <LogOut className="w-5 h-5 italic" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-16 overflow-y-auto italic font-bold">
                <header className="flex justify-between items-center mb-16 italic font-bold">
                    <div className="space-y-4 italic font-bold">
                        <div className="flex items-center gap-4 italic"><h1 className="text-6xl font-black text-slate-900 italic tracking-tighter italic font-bold">Dr. {userData?.name}</h1><div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black italic italic font-bold border border-emerald-200 shadow-sm">Verified Practitioner</div></div>
                        <p className="text-slate-400 font-bold italic text-xs uppercase tracking-widest opacity-80 italic italic font-bold">Medical ID: #DOC-{userData?.id}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-12 italic font-bold">
                    <div className="xl:col-span-3 space-y-12 italic font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 italic font-bold font-black uppercase tracking-widest text-[10px] text-slate-400">
                            {[{ label: 'Visits Today', value: stats.appointmentsToday, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' }, { label: 'Total Patients', value: stats.activePatients, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' }, { label: 'Hours Logged', value: `${stats.hours}h`, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' }].map((s, i) => (
                                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-200/50 italic italic font-bold group">
                                    <div className="flex justify-between items-center mb-6 italic italic italic italic">
                                        <div className={`p-5 ${s.bg} ${s.color} rounded-2xl italic italic italic font-bold group-hover:scale-110 transition-transform shadow-md`}><s.icon className="w-8 h-8 italic" /></div>
                                        <div className="text-5xl font-black text-slate-900 italic italic font-bold tracking-tighter">{s.value}</div>
                                    </div>
                                    <div className="italic italic italic font-bold whitespace-nowrap">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {activeTab === 'overview' && (
                            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden italic font-bold">
                                <div className="p-10 border-b border-slate-50 flex justify-between items-center italic bg-slate-50/50">
                                    <h3 className="text-3xl font-black text-slate-900 italic italic font-bold tracking-tight">Today&apos;s Appointments</h3>
                                    <div className="flex gap-4 italic font-bold"><button className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black italic italic font-bold tracking-widest uppercase">My History</button></div>
                                </div>
                                <div className="p-12 space-y-6 italic font-bold">
                                    {appointments.length > 0 ? appointments.map((appt, i) => (
                                        <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] flex justify-between items-center border border-slate-100 group hover:border-indigo-600 transition-all italic font-bold shadow-sm">
                                            <div className="flex items-center gap-8 italic">
                                                <div className="w-16 h-16 bg-white border border-slate-200 text-indigo-600 rounded-[1.5rem] flex items-center justify-center font-black italic shadow-lg">Pa</div>
                                                <div><div className="text-xl font-black italic italic font-bold text-slate-900 leading-none mb-2">Patient: #{appt.patientId}</div><div className="text-[10px] text-slate-500 font-bold italic italic font-bold uppercase tracking-[0.2em]">{appt.appointmentDate}</div></div>
                                            </div>
                                            <div className="flex gap-4 italic font-bold items-center">
                                                <div className="px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-xs font-black italic italic font-bold flex items-center gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"><FileText className="w-4 h-4 italic" /> Check Profile</div>
                                                <button className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-md italic hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle className="w-6 h-6 italic" /></button>
                                                <button className="p-3 bg-rose-100 text-rose-700 rounded-xl shadow-md italic hover:bg-rose-600 hover:text-white transition-all"><XCircle className="w-6 h-6 italic" /></button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center p-24 text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem] italic italic font-bold flex flex-col items-center gap-6">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center italic"><AlertCircle className="w-10 h-10 text-slate-200 italic" /></div>
                                            <div className="uppercase font-black text-sm tracking-[0.3em] italic italic font-bold">No visits scheduled right now.</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'prescriptions' && (
                            <div className="bg-white rounded-[4rem] p-16 shadow-2xl border border-slate-100 italic">
                                <div className="max-w-3xl mx-auto space-y-12 italic font-bold">
                                    <div className="space-y-4 italic font-bold">
                                        <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter italic font-bold">Issue e-Prescription</h3>
                                        <p className="text-slate-500 text-lg font-bold italic opacity-90 italic italic font-bold leading-relaxed">Write a secure digital prescription for your patient.</p>
                                    </div>
                                    <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100 space-y-10 italic">
                                        <div className="space-y-6 italic font-bold">
                                            <div className="flex items-center justify-between px-4 italic font-bold"><label className="text-xs font-black uppercase tracking-widest text-slate-400 italic italic font-bold">Medication Details</label></div>
                                            <textarea placeholder="e.g. Paracetamol 500mg, twice a day for 5 days." className="w-full bg-white border-2 border-slate-100 rounded-3xl p-8 text-base font-black text-slate-900 outline-none focus:border-indigo-600 shadow-inner min-h-[250px] italic"></textarea>
                                        </div>
                                        <button className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-6 hover:translate-y-[-4px] active:scale-[0.98] italic">
                                            Submit Prescription <Shield className="w-7 h-7 italic" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-12 italic font-bold">
                        <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-600/30 italic font-bold">
                             <h4 className="text-2xl font-black italic tracking-tighter italic font-bold mb-8 italic">Available Hours</h4>
                             <div className="space-y-6 italic font-bold">
                                {['07:00 PM - 09:00 PM', '05:00 PM - 08:00 PM'].map((s, i) => (
                                    <div key={i} className="flex items-center gap-4 text-xs font-black italic italic font-bold opacity-80 group hover:opacity-100 transition-opacity">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform italic"></div> {s}
                                    </div>
                                ))}
                                <button className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl mt-4 hover:scale-105 transition-transform italic">Update My Schedule</button>
                             </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 italic font-bold">
                             <h4 className="text-base font-black text-slate-900 mb-8 italic tracking-tight italic font-bold">New Submissions</h4>
                             <div className="space-y-6 italic font-bold">
                                {[
                                    { name: 'Patient #883', type: 'MRI Results', color: 'bg-indigo-50 text-indigo-600' },
                                    { name: 'Patient #102', type: 'Blood Test', color: 'bg-rose-50 text-rose-600' }
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center justify-between italic font-bold border-b border-slate-50 pb-4 last:border-0">
                                        <div className="flex items-center gap-4 italic font-bold">
                                            <div className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center font-black italic shadow-sm`}>Pa</div>
                                            <div><div className="text-xs font-black text-slate-900 italic italic font-bold">{p.name}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic italic font-bold">{p.type}</div></div>
                                        </div>
                                        <button className="p-2 hover:bg-slate-50 rounded-lg group transition-all italic"><ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 italic" /></button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
