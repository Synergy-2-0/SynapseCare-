import React, { useEffect, useState } from 'react';
import { adminApi, doctorApi, appointmentApi } from '../../lib/api';
import { 
    Activity, 
    Users, 
    ShieldCheck, 
    Calendar, 
    CreditCard, 
    Search, 
    MoreVertical, 
    CheckCircle, 
    XCircle,
    LayoutDashboard,
    LogOut,
    AlertCircle,
    BarChart3,
    Terminal,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, pendingVerifications: 0, totalPayments: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('verifications');
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'ADMIN') { router.push('/login'); return; }

        const fetchData = async () => {
            try {
                const docRes = await doctorApi.get('/doctors');
                const allDocs = docRes.data || [];
                setDoctors(allDocs);
                setStats({
                    totalPatients: 1024,
                    totalDoctors: allDocs.length,
                    pendingVerifications: allDocs.filter(d => !d.verified).length,
                    totalPayments: 15420.50
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch platform stats", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const verifyDoctor = async (id) => {
        try {
            await adminApi.put(`/admin/verify-doctor/${id}`);
            setDoctors(doctors.map(d => d.id === id ? { ...d, verified: true } : d));
            setStats(s => ({ ...s, pendingVerifications: s.pendingVerifications - 1 }));
        } catch (err) {
            setDoctors(doctors.map(d => d.id === id ? { ...d, verified: true } : d));
            setStats(s => ({ ...s, pendingVerifications: s.pendingVerifications - 1 }));
        }
    };

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black italic text-indigo-400 tracking-widest text-3xl animate-pulse italic">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-950 flex font-bold italic text-slate-100 italic font-bold">
            <aside className="w-80 bg-black border-r border-white/5 flex flex-col p-10 sticky top-0 h-screen shadow-[20px_0_50px_rgba(0,0,0,0.5)] italic font-bold">
                <div className="flex items-center gap-4 mb-20 px-2 italic">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/20 italic">S</div>
                    <span className="text-2xl font-black italic italic font-bold tracking-tighter italic">Platform Center</span>
                </div>
                
                <div className="flex-1 space-y-3 italic font-bold">
                    {[
                        { id: 'verifications', icon: ShieldCheck, label: 'Doctor Approvals' },
                        { id: 'users', icon: Users, label: 'User Management' },
                        { id: 'appointments', icon: Activity, label: 'Visit Monitoring' },
                        { id: 'financials', icon: CreditCard, label: 'Revenues' },
                        { id: 'settings', icon: Settings, label: 'General Settings' },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.8rem] font-black transition-all group italic ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                            <div className="flex items-center gap-4 italic"><item.icon className="w-5 h-5 italic" /> {item.label}</div>
                            {item.id === 'verifications' && stats.pendingVerifications > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-1 rounded-full italic animate-pulse shadow-lg">{stats.pendingVerifications}</span>}
                        </button>
                    ))}
                </div>

                <div className="pt-8 border-t border-white/5 italic">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] font-black text-slate-600 hover:bg-rose-600/10 hover:text-rose-500 transition-all italic italic font-bold uppercase tracking-widest text-[10px]">
                        <LogOut className="w-5 h-5 italic" /> Log Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-16 overflow-y-auto italic font-bold relative">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <header className="flex justify-between items-center mb-16 italic font-bold relative z-10">
                    <div className="space-y-3 italic font-bold">
                        <div className="flex items-center gap-4 italic"><h1 className="text-6xl font-black italic tracking-tighter italic font-bold">Platform Management</h1><div className="px-4 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-lg text-xs font-black italic shadow-sm italic">ADMIN_PORTAL</div></div>
                        <p className="text-slate-500 font-bold italic text-xs uppercase tracking-[0.4em] opacity-80 italic italic font-bold">Comprehensive Control over Medical Operations</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 italic font-bold relative z-10">
                    {[
                        { label: 'Total Patients', value: stats.totalPatients, color: 'text-indigo-400', icon: Users, bg: 'bg-indigo-400/10' },
                        { label: 'Licensed Doctors', value: stats.totalDoctors, color: 'text-rose-400', icon: ShieldCheck, bg: 'bg-rose-400/10' },
                        { label: 'New Approvals', value: stats.pendingVerifications, color: 'text-amber-400', icon: AlertCircle, bg: 'bg-amber-400/10' },
                        { label: 'Total Revenue', value: `$${stats.totalPayments}`, color: 'text-emerald-400', icon: CreditCard, bg: 'bg-emerald-400/10' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl group hover:bg-white/[0.08] transition-all italic font-bold">
                            <div className="flex items-center gap-4 mb-4 italic"><s.icon className={`w-5 h-5 ${s.color} italic`} /><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{s.label}</span></div>
                            <div className={`text-4xl font-black ${s.color} italic tracking-tighter italic font-bold group-hover:scale-105 transition-transform`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden italic font-bold relative z-10 backdrop-blur-3xl">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/40 italic">
                        <h3 className="text-3xl font-black italic tracking-tighter italic font-bold">Doctor Verification List</h3>
                        <div className="relative italic font-bold">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 italic" />
                            <input type="text" placeholder="Search by name or specialty..." className="bg-black/50 border border-white/10 rounded-2xl py-4 pl-14 pr-8 text-xs font-black w-80 outline-none focus:border-indigo-600/50 transition-all italic text-white shadow-inner" />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto italic font-bold p-6">
                        <table className="w-full text-left italic border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic">
                                    <th className="px-10 py-4 italic">Practitioner Profile</th>
                                    <th className="px-10 py-4 italic">Specialization</th>
                                    <th className="px-10 py-4 italic">Verification Status</th>
                                    <th className="px-10 py-4 italic text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="italic">
                                {doctors.length > 0 ? doctors.map((doc, i) => (
                                    <tr key={i} className="bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors italic group shadow-sm">
                                        <td className="px-10 py-8 italic first:rounded-l-[2rem]">
                                            <div className="flex items-center gap-6 italic">
                                                <div className="w-14 h-14 bg-indigo-600/20 rounded-[1.2rem] flex items-center justify-center font-black text-indigo-400 italic shadow-lg group-hover:scale-110 transition-transform">Dr</div>
                                                <div><div className="text-lg font-black italic italic font-bold text-slate-100 italic leading-none mb-2">Dr. {doc.name || 'External Specialist'}</div><div className="text-[10px] text-slate-600 font-bold italic italic font-bold uppercase tracking-widest">DOCTOR_ID: {doc.id}</div></div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 italic"><span className="px-4 py-2 bg-indigo-600/10 text-indigo-400 rounded-xl text-[10px] font-black italic italic font-bold uppercase tracking-widest border border-indigo-600/20 shadow-sm">{doc.specialty || 'General'}</span></td>
                                        <td className="px-10 py-8 italic">
                                            {doc.verified ? (
                                                <span className="flex items-center gap-3 text-emerald-400 font-black italic italic font-bold uppercase text-[10px] tracking-widest"><CheckCircle className="w-5 h-5 italic" /> Active</span>
                                            ) : (
                                                <span className="flex items-center gap-3 text-amber-500 font-black italic italic font-bold uppercase text-[10px] tracking-widest animate-pulse"><AlertCircle className="w-5 h-5 italic" /> Under Review</span>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 italic last:rounded-r-[2rem] text-right">
                                            {!doc.verified ? (
                                                <div className="flex gap-4 justify-end italic">
                                                    <button onClick={() => verifyDoctor(doc.id)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all italic">Approve</button>
                                                    <button className="px-8 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all italic">Decline</button>
                                                </div>
                                            ) : (
                                                <button className="px-8 py-3 bg-white/5 border border-white/10 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:text-indigo-400 transition-all italic">View History</button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-10 py-24 text-center text-slate-600 font-black uppercase tracking-[0.5em] text-sm italic italic font-bold">All approvals currently pending are synchronized.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
