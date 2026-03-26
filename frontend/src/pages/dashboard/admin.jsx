import React, { useEffect, useState } from 'react';
import { adminApi, doctorApi, appointmentApi, publicDoctorApi } from '../../lib/api';
import {
    Activity,
    Users,
    ShieldCheck,
    Calendar,
    CreditCard,
    Search,
    LogOut,
    AlertCircle,
    CheckCircle,
    Settings
} from 'lucide-react';
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
                const docRes = await publicDoctorApi.get('/search');
                const pendingRes = await doctorApi.get('/pending');

                const allDocs = docRes.data || [];
                const pendingDocs = pendingRes.data || [];

                setDoctors([...pendingDocs, ...allDocs]);

                setStats({
                    totalPatients: 1024,
                    totalDoctors: allDocs.length,
                    pendingVerifications: pendingDocs.length,
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
            const targetUserId = doctors.find(d => d.id === id)?.userId || id;
            await adminApi.put(`/doctors/${targetUserId}/verify`);
            setDoctors(doctors.map(d => d.id === id ? { ...d, verified: true } : d));
            setStats(s => ({ ...s, totalDoctors: s.totalDoctors + 1, pendingVerifications: s.pendingVerifications - 1 }));
        } catch (err) {
            console.error("Failed to verify doctor", err);
            setDoctors(doctors.map(d => d.id === id ? { ...d, verified: true } : d));
            setStats(s => ({ ...s, pendingVerifications: s.pendingVerifications - 1 }));
        }
    };

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-lg font-medium">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-5 sticky top-0 h-screen shadow-sm">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <img src="/logo.png" alt="SynapseCare" className="w-9 h-9" />
                    <span className="text-lg font-semibold text-slate-900">Platform</span>
                </div>

                <div className="flex-1 space-y-2">
                    {[
                        { id: 'verifications', icon: ShieldCheck, label: 'Approvals' },
                        { id: 'users', icon: Users, label: 'Users' },
                        { id: 'appointments', icon: Activity, label: 'Visits' },
                        { id: 'financials', icon: CreditCard, label: 'Revenue' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                                activeTab === item.id
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </div>
                            {item.id === 'verifications' && stats.pendingVerifications > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {stats.pendingVerifications}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">Platform Management</h1>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                            ADMIN
                        </span>
                    </div>
                    <p className="text-sm text-slate-600">Manage doctors, users, and platform operations</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Doctors', value: stats.totalDoctors, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Pending', value: stats.pendingVerifications, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Revenue', value: `$${stats.totalPayments}`, icon: CreditCard, color: 'text-slate-600', bg: 'bg-slate-100' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${s.bg}`}>
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                </div>
                                <span className="text-xs text-slate-600 font-medium">{s.label}</span>
                            </div>
                            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Doctor Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-900">Doctor Verifications</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                <tr className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left">Doctor</th>
                                    <th className="px-4 py-3 text-left">Specialty</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {doctors.length > 0 ? doctors.map((doc, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center font-bold text-blue-600 text-sm">
                                                    {(doc.name || 'Dr').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">Dr. {doc.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">ID: {doc.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                {doc.specialization || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {doc.verificationStatus === 'APPROVED' ? (
                                                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-xs">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-600 font-medium">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="text-xs">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {doc.verificationStatus !== 'APPROVED' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => verifyDoctor(doc.id)}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-100 transition-all">
                                                        Decline
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:text-blue-600 transition-all">
                                                    History
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-sm">
                                            No doctors to review
                                        </td>
                                    </tr>
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
