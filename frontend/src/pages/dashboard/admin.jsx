import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    WarningCircle,
    ShieldCheck,
    Users,
    ArrowUpRight,
    Stethoscope,
    CaretRight,
    CurrencyCircleDollar
} from '@phosphor-icons/react';
import { adminApi, paymentApi, doctorApi, patientApi, appointmentApi } from '../../lib/api';
import AdminLayout from '../../components/layout/AdminLayout';

// Premium Admin Components
import AdminStatCard from '../../components/admin/AdminStatCard';
import { DepartmentDoughnutChart, MiniSparkline } from '../../components/admin/AdminCharts';
import AdminMiniCalendar from '../../components/admin/AdminCalendar';
import VerificationDrawer from '../../components/admin/VerificationDrawer';
import AdminUserDrawer from '../../components/admin/AdminUserDrawer';
import AdminPaymentDrawer from '../../components/admin/AdminPaymentDrawer';

const getUserLabel = (user) => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.username || user?.email || `User #${user?.id || 'N/A'}`;
};

const formatMoney = (value) => {
    const amount = Number(value || 0);
    return `LKR ${amount.toLocaleString()}`;
};

const ADMIN_TABS = ['overview', 'verifications', 'doctors', 'patients', 'financials'];

const extractListData = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const extractObjectData = (response) => {
    const payload = response?.data;
    if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) return payload;
    return {};
};



const AdminDashboard = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [doctorDirectory, setDoctorDirectory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState({
        total: 0, success: 0, failed: 0, pending: 0, refunded: 0, totalRevenue: 0
    });
    
    const [appointmentsCount, setAppointmentsCount] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [processingId, setProcessingId] = useState(null);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [selectedReviewDoctor, setSelectedReviewDoctor] = useState(null);
    
    // New States for User Audit
    const [selectedAuditUser, setSelectedAuditUser] = useState(null);
    const [selectedAuditProfile, setSelectedAuditProfile] = useState(null);
    const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
    
    // New States for Payment Audit
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        const queryString = router.asPath.split('?')[1] || '';
        const params = new URLSearchParams(queryString);
        const tabFromQuery = params.get('tab');
        const nextTab = tabFromQuery && ADMIN_TABS.includes(tabFromQuery) ? tabFromQuery : 'overview';
        setActiveTab(nextTab);
    }, [router.isReady, router.asPath]);

    const fetchDashboardData = async ({ initialLoad = false } = {}) => {
        if (initialLoad) setLoading(true);
        try {
            setError('');
            const [usersRes, pendingRes, paymentRes, doctorDirectoryRes, patientProfilesRes, allPaymentsRes, appointmentsRes] = await Promise.allSettled([
                adminApi.get('/users'),
                adminApi.get('/doctors/pending'),
                paymentApi.get('/admin/summary'),
                doctorApi.get('/all'),
                patientApi.get('/'),
                paymentApi.get('/admin/ledger'),
                appointmentApi.get('/all')
            ]);

            const nextUsers = usersRes.status === 'fulfilled' ? extractListData(usersRes.value) : [];
            const nextPending = pendingRes.status === 'fulfilled' ? extractListData(pendingRes.value) : [];
            const nextDoctorDirectory = doctorDirectoryRes.status === 'fulfilled' ? extractListData(doctorDirectoryRes.value) : [];
            const nextPatientProfiles = patientProfilesRes.status === 'fulfilled' ? extractListData(patientProfilesRes.value) : [];
            const nextTransactions = allPaymentsRes.status === 'fulfilled' ? extractListData(allPaymentsRes.value) : [];
            const nextPaymentSummary = paymentRes.status === 'fulfilled' ? extractObjectData(paymentRes.value) : {};
            const nextAppointments = appointmentsRes.status === 'fulfilled' ? extractListData(appointmentsRes.value) : [];

            setUsers(nextUsers);
            setPendingDoctors(nextPending);
            setDoctorDirectory(nextDoctorDirectory);
            setTransactions(nextTransactions);
            setAppointmentsCount(nextAppointments.length);
            
            // Critical Sync: Joining Auth records with Clinical Profile records
            const patientUsers = nextUsers.filter(u => u.role === 'PATIENT');
            const syncedPatients = patientUsers.map(user => {
                const profile = nextPatientProfiles.find(p => p.userId === user.id) || {};
                return { ...user, ...profile, userId: user.id, profileId: profile.id };
            });
            setPatients(syncedPatients);

            setPaymentSummary({
                total: nextPaymentSummary.total || 0,
                success: nextPaymentSummary.success || 0,
                failed: nextPaymentSummary.failed || 0,
                pending: nextPaymentSummary.pending || 0,
                refunded: nextPaymentSummary.refunded || 0,
                totalRevenue: nextPaymentSummary.totalRevenue || 0
            });
        } catch (err) {
            console.error('Failed to load admin data', err);
            setError('Executive cluster sync failed. Handshake interrupted.');
        } finally {
            if (initialLoad) setLoading(false);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'ADMIN') { router.push('/login'); return; }
        fetchDashboardData({ initialLoad: true });
    }, [router]);

    const stats = useMemo(() => {
        return {
            totalUsers: users.length,
            totalDoctors: doctorDirectory.length,
            totalPatients: patients.length,
            pendingVerifications: pendingDoctors.length,
            revenue: Number(paymentSummary.totalRevenue || 0)
        };
    }, [users, pendingDoctors, paymentSummary, doctorDirectory, patients]);

    const filteredDoctorsList = useMemo(() => {
        return doctorDirectory;
    }, [doctorDirectory]);

    const filteredPatientsList = useMemo(() => {
        const patientUsers = users.filter(u => u.role === 'PATIENT');
        
        return patientUsers.map(user => {
            const profile = patients.find(p => p.userId === user.id) || {};
            return {
                ...user,
                profileId: profile.id,
                gender: profile.gender,
                phone: profile.phone || user.phone,
                address: profile.address
            };
        });
    }, [patients, users]);

    const mergedPending = useMemo(() => {
        return pendingDoctors.map(doctorUser => {
            const profile = doctorDirectory.find(d => d.userId === doctorUser.id) || null;
            return { ...doctorUser, doctorProfile: profile };
        });
    }, [pendingDoctors, doctorDirectory]);

    const handleVerifyClick = (doctor) => {
        setSelectedReviewDoctor(doctor);
        setIsVerificationOpen(true);
    };

    const runVerification = async (doctorId, status) => {
        try {
            setProcessingId(doctorId);
            if (status === 'REJECTED') {
                const reason = window.prompt('Enter rejection reason:') || '';
                if (!reason?.trim()) return;
                await adminApi.put(`/doctors/${doctorId}/verify`, { status: status, rejectionReason: reason.trim() });
            } else {
                await adminApi.put(`/doctors/${doctorId}/verify`, { status: 'APPROVED' });
            }
            setIsVerificationOpen(false);
            await fetchDashboardData({ initialLoad: false });
        } catch (err) {
            console.error('Action failed', err);
            setError('Verification update failed. Check cluster connection.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleAuditClick = (user, type) => {
        setSelectedAuditUser(user);
        if (type === 'DOCTOR') {
            const profile = doctorDirectory.find(d => d.userId === user.id) || user.doctorProfile;
            setSelectedAuditProfile(profile);
        } else {
            const profile = patients.find(p => p.userId === user.id) || {};
            setSelectedAuditProfile(profile);
        }
        setIsUserDrawerOpen(true);
    };

    const handlePaymentAuditClick = (tx) => {
        setSelectedTransaction(tx);
        setIsPaymentDrawerOpen(true);
    };

    const handleToggleUserStatus = async (userId) => {
        try {
            setProcessingId(userId);
            await adminApi.put(`/users/${userId}/toggle-status`);
            
            // Close drawer and refresh
            setIsUserDrawerOpen(false);
            await fetchDashboardData({ initialLoad: false });
        } catch (err) {
            console.error('Status toggle failed', err);
            setError('Network sync error during status propagation.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            setProcessingId(userId);
            await adminApi.delete(`/users/${userId}`);
            
            setIsUserDrawerOpen(false);
            await fetchDashboardData({ initialLoad: false });
        } catch (err) {
            console.error('Delete failed', err);
            setError('Cluster deletion failed. Node identity persistent.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return null;

    return (
        <AdminLayout title="Executive Hub">
            <div className="flex flex-col gap-4 pt-0">
                {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm">
                            <WarningCircle size={18} weight="light" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">Sync Error</p>
                            <p className="text-sm font-bold text-rose-900 leading-tight">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Top Statistics Tier */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AdminStatCard label="Patients Registered" value={stats.totalPatients} icon={Users} trend={{ value: '16%', isPositive: true }} colorClass="text-teal-600" bgColorClass="bg-teal-50" delay={0} />
                    <AdminStatCard label="Doctor Verification" value={stats.pendingVerifications} icon={ShieldCheck} trend={{ value: stats.pendingVerifications === 0 ? 'Clear' : 'Pending', isPositive: stats.pendingVerifications === 0 }} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" delay={0.1} />
                    <AdminStatCard label="Certified Doctors" value={stats.totalDoctors} icon={Stethoscope} trend={{ value: 'Stable', isPositive: true }} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" delay={0.2} />
                    <AdminStatCard label="Total Revenue" value={formatMoney(stats.revenue)} icon={CurrencyCircleDollar} trend={{ value: '14%', isPositive: true }} colorClass="text-amber-600" bgColorClass="bg-amber-50" delay={0.3} />
                </div>

                {/* Master Tab Hub */}
                <div className="flex justify-center w-full my-2">
                    <div className="flex items-center bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
                        {ADMIN_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    router.replace({ pathname: '/dashboard/admin', query: tab === 'overview' ? {} : { tab } }, undefined, { shallow: true });
                                }}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all relative ${activeTab === tab ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="hub-active" className="absolute inset-0 bg-teal-600 rounded-xl -z-10" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dashboard Tab Content Container */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[500px]"
                    >
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                <div className="xl:col-span-8 space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <AdminMiniCalendar />
                                        <div className="grid grid-cols-1 gap-4">
                                            <MiniSparkline title="Patient Growth" value={stats.totalPatients} percentage="16" color="#0D9488" data={[{value: 30}, {value: 45}, {value: 32}, {value: 50}, {value: 48}, {value: 65}, {value: 52}]} />
                                            <MiniSparkline title="Available Clinicians" value={stats.totalDoctors} percentage="4" color="#10B981" data={[{value: 20}, {value: 22}, {value: 21}, {value: 25}, {value: 24}, {value: 28}, {value: 27}]} />
                                            <MiniSparkline title="Active Appointments" value={appointmentsCount.toString()} percentage="21" color="#8B5CF6" data={[{value: 100}, {value: 120}, {value: 115}, {value: 140}, {value: 135}, {value: 160}, {value: 158}]} />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-50 shadow-sm flex items-center justify-center min-h-[300px]">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Admission Trends Shard Empty | Live Sync Pending</p>
                                    </div>
                                </div>
                                <div className="xl:col-span-4 space-y-6">
                                    <DepartmentDoughnutChart 
                                        data={Object.entries(doctorDirectory.reduce((acc, d) => {
                                            const spec = d.specialization || 'General';
                                            acc[spec] = (acc[spec] || 0) + 1;
                                            return acc;
                                        }, {})).map(([name, value]) => ({ name, value }))} 
                                        title="Clinical Domain Spread" 
                                    />
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Access Log</h3>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Live Feed</p>
                                            </div>
                                            <ArrowUpRight size={16} weight="light" className="text-slate-300" />
                                        </div>
                                        <div className="space-y-4">
                                            {users.slice(0, 5).map(user => (
                                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">{user.firstName?.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-[12px] font-bold text-slate-800">{getUserLabel(user)}</p>
                                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest">{user.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}

                        {activeTab === 'verifications' && (
                             <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase">Faculty Enrollment Pipeline</h2>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Awaiting Clinical Authentication</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-white px-5 py-2 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{mergedPending.length} Actions Required</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50">
                                            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <th className="px-8 py-5">Practitioner ID</th>
                                                <th className="px-8 py-5">Classification</th>
                                                <th className="px-8 py-5 text-right">Review Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {mergedPending.map(doctor => (
                                                <tr key={doctor.id} className="hover:bg-teal-50/10 transition-all group cursor-pointer border-l-2 border-l-transparent hover:border-l-teal-600">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">{doctor.firstName?.charAt(0)}</div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-slate-900 leading-none">{getUserLabel(doctor)}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest font-mono">#{doctor.id?.toString().slice(-4)} | CRED-INERT</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-teal-500" />
                                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{doctor.doctorProfile?.specialization || 'CLINICAL INGRESS'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button onClick={() => handleVerifyClick(doctor)} className="px-5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-white border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-500 transition-all shadow-sm">Inspect Record</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {mergedPending.length === 0 && (
                                                <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Pipeline Clear | Zero Pending Authentication</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        )}

                        {activeTab === 'doctors' && (
                             <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase">Medical Faculty Registry</h2>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Administrative Audit of {doctorDirectory.length} Clinicians</p>
                                    </div>
                                    <div className="bg-white px-5 py-2 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doctorDirectory.length} Active Faculty</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50">
                                            <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                                <th className="px-8 py-5">Physician Identity</th>
                                                <th className="px-8 py-5">Clinical Domain</th>
                                                <th className="px-8 py-5">Master Index</th>
                                                <th className="px-8 py-5 text-right w-20">Audit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                             {filteredDoctorsList.map(doctor => {
                                                const user = users.find(u => u.id === doctor.userId) || doctor.user || {};
                                                const isActive = user.status === 'ACTIVE';
                                                return (
                                                    <tr key={doctor.id} className="hover:bg-teal-50/10 transition-all border-l-2 border-l-transparent hover:border-l-emerald-600 group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <Image 
                                                                        src={user?.profilePic || doctor.profilePic || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0ea5e9&color=fff&bold=true`} 
                                                                        className="w-10 h-10 rounded-xl shadow-sm object-cover" 
                                                                        alt="dr" 
                                                                        width={40}
                                                                        height={40}
                                                                        unoptimized
                                                                    />
                                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{user?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[11px] font-bold text-slate-700">{doctor.specialization || 'General Practice'}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isActive ? 'Available' : 'Restricted'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                                                <span className="text-[10px] font-mono text-slate-600 tabular-nums font-bold">LIC-{doctor.licenseNumber || '00000'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <button 
                                                                onClick={() => handleAuditClick(user, 'DOCTOR')}
                                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white hover:text-teal-600 hover:shadow-md hover:border hover:border-slate-100 transition-all ml-auto"
                                                            >
                                                                <ArrowUpRight size={14} weight="light" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        )}

                        {activeTab === 'patients' && (
                             <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase">Clinical Patient Registry</h2>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Oversight for {filteredPatientsList.length} Case Files</p>
                                    </div>
                                    <div className="bg-white px-5 py-2 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{filteredPatientsList.length} Active Patients</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50">
                                            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <th className="px-8 py-5">Patient Identity</th>
                                                <th className="px-8 py-5">Case Metadata</th>
                                                <th className="px-8 py-5">Comm Link</th>
                                                <th className="px-8 py-5 text-right">Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                             {filteredPatientsList.map(p => {
                                                const isActive = p.status === 'ACTIVE';
                                                return (
                                                    <tr key={p.id} className="hover:bg-indigo-50/10 transition-all border-l-2 border-l-transparent hover:border-l-indigo-600 group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <Image 
                                                                        src={p?.profilePic || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=6366f1&color=fff&bold=true`} 
                                                                        className="w-10 h-10 rounded-xl shadow-sm object-cover" 
                                                                        alt="px" 
                                                                        width={40}
                                                                        height={40}
                                                                        unoptimized
                                                                    />
                                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-slate-900 leading-none">{p.firstName} {p.lastName}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{p.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${p.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                    {p.gender || 'UNSYNC'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400 font-mono">#{p.id || '000'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-[11px] font-bold text-slate-700 font-mono tracking-tighter">{p.phone || 'NO LINK'}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase">Encrypted Channel</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <button 
                                                                onClick={() => handleAuditClick(p, 'PATIENT')}
                                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white hover:text-indigo-600 hover:shadow-md hover:border hover:border-slate-100 transition-all ml-auto"
                                                            >
                                                                <CaretRight size={16} weight="light" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        )}

                        {activeTab === 'financials' && (
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-50 shadow-sm relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <CurrencyCircleDollar size={48} className="text-slate-900" weight="light" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Hub</p>
                                        <h2 className="text-2xl font-bold text-slate-900 mt-2">{formatMoney(paymentSummary.totalRevenue)}</h2>
                                        <p className="text-[9px] text-emerald-500 font-bold uppercase mt-2 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            +12.4% Velocity <ArrowUpRight size={10} />
                                        </p>
                                    </div>
                                    <div className="bg-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-600/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-15">
                                            <ShieldCheck size={48} weight="light" />
                                        </div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Settled Shards</p>
                                        <h2 className="text-2xl font-bold mt-2">{paymentSummary.success}</h2>
                                        <p className="text-[9px] font-bold uppercase mt-2 opacity-80">Verified Transaction Integrity</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-50 shadow-sm group">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Audit Required</p>
                                        <h2 className="text-2xl font-bold text-slate-900 mt-2">{paymentSummary.failed || 0}</h2>
                                        <p className="text-[9px] text-rose-500 font-bold uppercase mt-2 inline-flex items-center gap-1">
                                            Handover to Finance Team <WarningCircle size={10} weight="light" />
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
                                     <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900 uppercase">Global Settlement Ledger</h2>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Tracking {transactions.length} Financial Events</p>
                                        </div>
                                        <div className="bg-white px-5 py-2 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master Ledger Active</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50">
                                                <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                                                    <th className="px-8 py-5">Event ID</th>
                                                    <th className="px-8 py-5">Value Shard</th>
                                                    <th className="px-8 py-5">Status</th>
                                                    <th className="px-8 py-5 text-right">Audit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {transactions.slice(0, 50).map(tx => (
                                                    <tr key={tx.paymentId} className="hover:bg-slate-50/50 transition-all border-l-2 border-l-transparent hover:border-l-indigo-600">
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-mono font-bold text-slate-900 tracking-tighter uppercase">{tx.paymentId.substring(0, 15)}...</span>
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">{new Date(tx.createdAt).toLocaleDateString()} @ {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-bold text-slate-900">{formatMoney(tx.amount)} {tx.currency || 'LKR'}</span>
                                                                <span className="text-[9px] text-slate-400 font-mono tracking-widest mt-1">Ref: {tx.merchantOrderId || 'LOCAL'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                                                tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                tx.status === 'REFUNDED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                                tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-rose-50 text-rose-600 border-rose-100'
                                                            }`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {tx.status === 'SUCCESS' && (
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (confirm('Initiate executive refund for this shard?')) {
                                                                            try {
                                                                                await paymentApi.post(`/${tx.paymentId}/refund`);
                                                                                fetchDashboardData();
                                                                            } catch (e) {
                                                                                console.error('Refund failure', e);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-500 transition-all shadow-sm"
                                                                >
                                                                    Refund
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handlePaymentAuditClick(tx)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-100 transition-all ml-auto mt-1"
                                                            >
                                                                <ArrowUpRight size={14} weight="light" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {transactions.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">Ledger Clear | Zero Financial Records Found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                             </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <VerificationDrawer 
                isOpen={isVerificationOpen}
                onClose={() => setIsVerificationOpen(false)}
                doctor={selectedReviewDoctor}
                onApprove={(id) => runVerification(id, 'APPROVED')}
                onReject={(id) => runVerification(id, 'REJECTED')}
                processingId={processingId}
            />

            <AdminUserDrawer
                isOpen={isUserDrawerOpen}
                onClose={() => setIsUserDrawerOpen(false)}
                user={selectedAuditUser}
                profile={selectedAuditProfile}
                onToggleStatus={handleToggleUserStatus}
                onDelete={handleDeleteUser}
                processingId={processingId}
            />

            <AdminPaymentDrawer 
                isOpen={isPaymentDrawerOpen}
                onClose={() => setIsPaymentDrawerOpen(false)}
                transaction={selectedTransaction}
            />
        </AdminLayout>
    );
};

export default AdminDashboard;
