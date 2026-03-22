import React, { useEffect, useState } from 'react';
import { patientApi, appointmentApi } from '../../lib/api';
import { 
    Activity, 
    Calendar, 
    Clock, 
    FileText, 
    LayoutDashboard, 
    LogOut, 
    MessageSquare, 
    MoreVertical, 
    Plus, 
    Search, 
    Shield, 
    Stethoscope, 
    User, 
    Video 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

const PatientDashboard = () => {
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 0 });
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState({ id: '0000', name: 'Guest' });
    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        const userName = localStorage.getItem('user_name');
        if (!userId) { router.push('/login'); return; }
        
        setUserData({ id: userId, name: userName || 'Guest' });

        const fetchData = async () => {
            try {
                const res = await appointmentApi.get(`/appointments/patient/${userId}`);
                const allAppts = res.data || [];
                const confirmed = allAppts.filter((a) => a.status === 'CONFIRMED');
                setUpcoming(confirmed);
                setStats(s => ({ ...s, appointments: confirmed.length }));
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const logout = () => { localStorage.clear(); router.push('/login'); };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-bold italic">
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen shadow-sm z-50 italic font-bold">
                <div className="flex items-center gap-3 mb-12 px-2 italic font-bold">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20 italic">S</div>
                    <span className="text-xl font-black text-slate-900 tracking-tight italic">SynapseCare</span>
                </div>
                <div className="flex-1 space-y-2 italic font-bold">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'appointments', icon: Calendar, label: 'Appointments' },
                        { id: 'doctors', icon: Stethoscope, label: 'Find Doctors' },
                        { id: 'reports', icon: FileText, label: 'Medical Reports' },
                        { id: 'telemedicine', icon: Video, label: 'Telemedicine' },
                        { id: 'chat', icon: MessageSquare, label: 'AI Health Chat' },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all italic ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                            <item.icon className="w-5 h-5 italic" /> {item.label}
                        </button>
                    ))}
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-2 italic">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all italic">
                        <LogOut className="w-5 h-5 italic" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto italic font-bold">
                <header className="flex justify-between items-center mb-10 italic font-bold">
                    <div className="space-y-1 italic italic italic">
                        <h1 className="text-3xl font-black text-slate-900 italic">Patient Hub</h1>
                        <p className="text-slate-500 font-medium italic opacity-70 italic">Synchronized with Node #{userData.id}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 italic font-bold">
                    <div className="xl:col-span-2 space-y-8 italic font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 italic font-bold">
                            {[{ label: 'Consultations', value: stats.appointments, icon: Calendar, color: 'text-primary' }, { label: 'Reports', value: stats.reports, icon: FileText, color: 'text-indigo-600' }, { label: 'Active Meds', value: stats.prescriptions, icon: Activity, color: 'text-emerald-600' }].map((s, i) => (
                                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 italic">
                                    <div className="text-3xl font-black text-slate-900 mb-1 italic italic font-bold">{s.value}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic italic italic italic"><s.icon className="w-3 h-3 italic" /> {s.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden italic font-bold">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center italic">
                                <h3 className="text-xl font-black text-slate-900 italic italic">Timeline View</h3>
                            </div>
                            <div className="p-8 text-center text-slate-300 italic">
                                {upcoming.length > 0 ? "Upcoming sessions listed below..." : "No active sessions found in this node."}
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex justify-between items-center relative overflow-hidden italic font-bold">
                             <div className="relative z-10 space-y-4 italic font-bold">
                                <h3 className="text-2xl font-black italic">Cloud Storage Sync</h3>
                                <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black shadow-lg shadow-indigo-900/20 flex items-center gap-2 hover:scale-105 transition-transform italic">
                                    <Plus className="w-5 h-5 italic" /> Upload Report
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-8 italic font-bold">
                        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center space-y-4 italic">
                            <Activity className="w-12 h-12 text-rose-500 mx-auto animate-pulse italic" />
                            <h3 className="text-xl font-black text-rose-900 italic">Critical Node</h3>
                            <button className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-500/20 italic">Emergency Link</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
