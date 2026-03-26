import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    User,
    FileText,
    MessageSquare,
    Video,
    LogOut,
    Shield,
    Download,
    Plus,
    Clock,
    Activity,
    AlertCircle,
    ClipboardList,
    ChevronRight
} from 'lucide-react';
import { patientApi, appointmentApi, medicalHistoryApi } from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 2 });
    const [upcoming, setUpcoming] = useState([]);
    const [history, setHistory] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const name = localStorage.getItem('user_name');
            const id = localStorage.getItem('user_id');

            if (role !== 'PATIENT') {
                router.push('/login');
                return;
            }

            const fetchData = async () => {
                try {
                    const [apptRes, patientRes, historyRes, reportRes] = await Promise.all([
                        appointmentApi.get(`/patient/${id}`).catch(() => ({ data: [] })),
                        patientApi.get(`/${id}`).catch(() => ({ data: { data: {} } })),
                        medicalHistoryApi.get(`/patient/${id}`).catch(() => ({ data: { data: [] } })),
                        patientApi.get(`/${id}/reports`).catch(() => ({ data: { data: [] } }))
                    ]);

                    const allAppts = apptRes.data || [];
                    const patientInfo = patientRes.data?.data || {};
                    const historyInfo = historyRes.data?.data || [];
                    const reportInfo = reportRes.data?.data || [];

                    setUserData({ ...patientInfo, name: patientInfo.name || name, id });
                    setUpcoming(allAppts.filter((a) => a.status === 'CONFIRMED' || a.status === 'PAID'));
                    setHistory(historyInfo);
                    setReports(reportInfo);
                    setStats({
                        appointments: allAppts.length,
                        reports: reportInfo.length,
                        prescriptions: 2
                    });
                } catch (err) {
                    console.error('Failed to fetch dashboard data', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [router]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const sidebarItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'appointments', icon: Calendar, label: 'Appointments' },
        { id: 'reports', icon: FileText, label: 'Medical Records' },
        { id: 'prescriptions', icon: Shield, label: 'Prescriptions' },
        { id: 'telemedicine', icon: Video, label: 'Virtual Care' },
        { id: 'chat', icon: MessageSquare, label: 'AI Health Chat' },
        { id: 'profile', icon: User, label: 'Profile Settings' }
    ];

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Syncing your care dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="grid min-h-screen xl:grid-cols-[280px_1fr]">
                <aside className="hidden xl:flex flex-col border-r border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3 px-2 py-2 mb-7">
                        <img src="/logo.png" alt="SynapseCare" className="w-10 h-10" />
                        <div>
                            <p className="font-semibold leading-tight">SynapseCare</p>
                            <p className="text-xs copy-muted">Patient Workspace</p>
                        </div>
                    </div>

                    <nav className="space-y-2 flex-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                                    activeTab === item.id
                                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={logout}
                        className="mt-5 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </aside>

                <main className="p-4 md:p-7 xl:p-8">
                    <header className="surface-card p-5 md:p-6 mb-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm copy-muted">Patient ID #{String(userData?.id || '').padStart(4, '0')}</p>
                                <h1 className="text-2xl md:text-3xl font-semibold mt-1">Welcome, {userData?.name?.split(' ')[0] || 'Patient'}</h1>
                                <p className="copy-muted mt-1 text-sm">Track appointments, records, and consultation readiness in one place.</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm">
                                    <p className="text-xs text-emerald-700">System</p>
                                    <p className="font-semibold text-emerald-800 flex items-center gap-2"><Activity className="w-4 h-4" /> Connected</p>
                                </div>
                                <Link href="/chat" className="rounded-2xl bg-blue-600 text-white px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                                    AI Assistant <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </header>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Appointments', value: stats.appointments, icon: Calendar, color: 'text-blue-700', bg: 'bg-blue-50' },
                                    { label: 'Medical Reports', value: stats.reports, icon: FileText, color: 'text-rose-700', bg: 'bg-rose-50' },
                                    { label: 'Prescriptions', value: stats.prescriptions, icon: Shield, color: 'text-emerald-700', bg: 'bg-emerald-50' }
                                ].map((s) => (
                                    <motion.div key={s.label} whileHover={{ y: -2 }} className="surface-card p-5">
                                        <div className="flex justify-between items-center">
                                            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} grid place-items-center`}>
                                                <s.icon className="w-5 h-5" />
                                            </div>
                                            <p className="text-2xl font-semibold">{s.value}</p>
                                        </div>
                                        <p className="mt-3 text-sm copy-muted">{s.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <section className="surface-card p-5 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="title-section">Upcoming appointments</h2>
                                    <button className="text-sm font-semibold text-blue-700">Manage all</button>
                                </div>
                                <div className="space-y-3">
                                    {upcoming.length > 0 ? (
                                        upcoming.map((appt, i) => (
                                            <div key={`${appt.id || i}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">Doctor #{appt.doctorId}</p>
                                                    <p className="text-sm copy-muted mt-0.5">{appt.appointmentDate} • {appt.status}</p>
                                                </div>
                                                <button className="text-sm font-semibold text-blue-700 inline-flex items-center gap-1">
                                                    View details <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                                            <Calendar className="w-10 h-10 mx-auto text-slate-500" />
                                            <p className="copy-muted mt-3">No upcoming appointments</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-3xl bg-linear-to-r from-[#1164cf] to-[#0f95b0] text-white p-6 md:p-8 shadow-2xl">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-blue-100">AI Triage Assistant</p>
                                        <h3 className="text-2xl md:text-3xl font-semibold mt-1">Get guided symptom insights before booking care.</h3>
                                        <p className="text-blue-100 mt-2 text-sm max-w-xl">Use our AI assistant for structured pre-consultation guidance and faster specialist matching.</p>
                                    </div>
                                    <Link href="/chat" className="bg-white text-[#0f5dbd] px-5 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 hover:bg-slate-100 transition-colors">
                                        Open Assistant <Activity className="w-4 h-4" />
                                    </Link>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="surface-card p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                                <h2 className="title-section">Medical records and reports</h2>
                                <button className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" /> Upload Document
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-5">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-3">Clinical history</p>
                                    <div className="space-y-3">
                                        {history.length > 0 ? history.map((item, i) => (
                                            <div key={`${item.id || i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-xs text-blue-700">Case #{item.id}</p>
                                                <p className="font-semibold mt-1">{item.condition}</p>
                                                <p className="copy-muted text-sm mt-1">{item.treatment}</p>
                                                <p className="text-xs copy-muted mt-2">{item.diagnosisDate}</p>
                                            </div>
                                        )) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                                <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
                                                <p className="copy-muted mt-3">No history records available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-3">Diagnostic reports</p>
                                    <div className="space-y-3">
                                        {reports.length > 0 ? reports.map((rpt, i) => (
                                            <div key={`${rpt.id || i}`} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 grid place-items-center">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{rpt.description}</p>
                                                        <p className="text-xs copy-muted">Report #{rpt.id}</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm font-semibold text-blue-700 inline-flex items-center gap-1">
                                                    Download <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                                <FileText className="w-8 h-8 mx-auto text-slate-500" />
                                                <p className="copy-muted mt-3">No reports uploaded yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="surface-card p-5 md:p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="title-section">Profile settings</h2>
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 grid place-items-center">
                                    <User className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Full Name', value: userData?.name },
                                    { label: 'Email', value: userData?.email },
                                    { label: 'Phone', value: userData?.phone || 'Not set' },
                                    { label: 'Date of Birth', value: userData?.dob || 'Unknown' },
                                    { label: 'Gender', value: userData?.gender || 'Not specified' },
                                    { label: 'Blood Group', value: userData?.bloodGroup || 'Unknown' },
                                    { label: 'Emergency Contact', value: userData?.emergencyContact || 'Not assigned' },
                                    { label: 'Allergies', value: userData?.allergies || 'None listed' }
                                ].map((field) => (
                                    <div key={field.label} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{field.label}</p>
                                        <p className="font-semibold mt-2">{field.value || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                                    Update Profile
                                </button>
                                <button className="px-5 py-3 rounded-2xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors">
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    )}

                    {!['overview', 'reports', 'profile'].includes(activeTab) && (
                        <div className="surface-card p-10 text-center">
                            <ClipboardList className="w-10 h-10 mx-auto text-slate-500" />
                            <h3 className="text-xl font-semibold mt-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module</h3>
                            <p className="copy-muted mt-2">This module is ready for the next phase of detailed UX implementation.</p>
                            <div className="mt-5 flex items-center justify-center gap-3">
                                <button onClick={() => setActiveTab('overview')} className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                                    Back to Overview
                                </button>
                                <Link href={activeTab === 'chat' ? '/chat' : activeTab === 'telemedicine' ? '/telemedicine' : '/appointments'} className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-1">
                                    Open Related Page <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    <section className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="surface-card p-5">
                            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Quick Assist</p>
                            <div className="mt-3 space-y-3">
                                <button className="w-full py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors inline-flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Emergency SOS
                                </button>
                                <button className="w-full py-3 rounded-2xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors">
                                    Talk to Support Team
                                </button>
                            </div>
                        </div>
                        <div className="surface-card p-5">
                            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Next sync</p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">4 days remaining</p>
                                    <p className="copy-muted text-sm">Care profile sync scheduled for March 30</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default PatientDashboard;
