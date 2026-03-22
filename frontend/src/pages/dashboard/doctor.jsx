import React, { useEffect, useState } from 'react';
import { doctorApi, appointmentApi } from '../../lib/api';
import { 
    Activity, 
    Calendar, 
    Clock, 
    FileText, 
    LayoutDashboard, 
    LogOut, 
    Video,
    Users,
    Clipboard,
    Clock3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

const DoctorDashboard = () => {
    const [stats, setStats] = useState({ activePatients: 0, appointmentsToday: 0, hours: 0 });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState({ id: '0000', name: 'Specialist' });
    const router = useRouter();

    useEffect(() => {
        const docId = localStorage.getItem('user_id');
        const docName = localStorage.getItem('user_name');
        if (!docId) { router.push('/login'); return; }

        setUserData({ id: docId, name: docName || 'Specialist' });

        const fetchData = async () => {
            try {
                const res = await appointmentApi.get(`/appointments/doctor/${docId}`);
                const all = res.data || [];
                setAppointments(all);
                setStats({
                    activePatients: [...new Set(all.map((a) => a.patientId))].length,
                    appointmentsToday: all.filter((a) => a.status === 'CONFIRMED').length,
                    hours: 42
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch doctor dashboard data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const logout = () => { localStorage.clear(); router.push('/login'); };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-bold italic">
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen shadow-sm z-50 italic">
                <div className="flex items-center gap-3 mb-12 px-2 italic">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20 italic">S</div>
                    <span className="text-xl font-black text-slate-900 tracking-tight italic">SynapseCare</span>
                </div>
                <div className="flex-1 space-y-2 italic font-bold">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'appointments', icon: Calendar, label: 'Schedule' },
                        { id: 'patients', icon: Users, label: 'Patient Registry' },
                        { id: 'slots', icon: Clock3, label: 'Manage Slots' },
                        { id: 'prescriptions', icon: Clipboard, label: 'Prescriptions' },
                        { id: 'teleconsult', icon: Video, label: 'Telemedicine' },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all italic ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                            <item.icon className="w-5 h-5 italic" /> {item.label}
                        </button>
                    ))}
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-2 italic">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all italic italic italic">
                        <LogOut className="w-5 h-5 italic" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto italic font-bold">
                <header className="flex justify-between items-center mb-10 italic">
                    <div className="space-y-1 italic italic italic">
                        <h1 className="text-3xl font-black text-slate-900 italic">Clinical Master</h1>
                        <p className="text-slate-500 font-medium italic opacity-70 italic">Operational Mode: Active Terminal #{userData.id}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 italic font-bold">
                    <div className="xl:col-span-3 space-y-8 italic font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 italic">
                            {[{ label: 'Schedule Queue', value: stats.appointmentsToday, icon: Calendar, color: 'text-primary' }, { label: 'Managed Patients', value: stats.activePatients, icon: Users, color: 'text-indigo-600' }, { label: 'Total Hours', value: `${stats.hours}h`, icon: Clock, color: 'text-emerald-600' }].map((s, i) => (
                                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 italic">
                                    <div className={`text-4xl font-black ${s.color} mb-2 tracking-tighter italic`}>{s.value}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic italic italic font-bold"><s.icon className="w-3 h-3 italic" /> {s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 italic font-bold">
                        <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 relative overflow-hidden italic font-bold">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl italic"></div>
                             <div className="space-y-2 relative z-10 italic font-bold">
                                <h3 className="text-xl font-black italic">Publish Availability</h3>
                             </div>
                             <button className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-orange-500/10 hover:scale-105 active:scale-95 transition-transform italic">Open New Slot</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
