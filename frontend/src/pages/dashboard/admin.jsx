import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    RefreshCw,
    Search,
    ShieldCheck,
    UserCog,
    Users
} from 'lucide-react';
import {
    adminApi,
    paymentApi,
    doctorApi,
    patientApi,
    appointmentApi,
    telemedicineApi,
    prescriptionApi
} from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';

const getUserLabel = (user) => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.username || user?.email || `User #${user?.id || 'N/A'}`;
};

const formatMoney = (value) => {
    const amount = Number(value || 0);
    return `LKR ${amount.toLocaleString()}`;
};

const ADMIN_TABS = ['overview', 'verifications', 'doctors', 'patients', 'users', 'operations', 'financials', 'services'];

const extractListData = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const extractObjectData = (response) => {
    const payload = response?.data;
    if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        return payload.data;
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        return payload;
    }

    return {};
};

const AdminDashboard = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [doctorDirectory, setDoctorDirectory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState({
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        refunded: 0,
        totalRevenue: 0
    });
    const [serviceHealth, setServiceHealth] = useState({
        admin: false,
        payments: false,
        doctors: false,
        patients: false,
        appointments: false,
        telemedicine: false,
        prescriptions: false,
        notifications: false
    });

    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [operationsLoading, setOperationsLoading] = useState(false);
    const [operationsError, setOperationsError] = useState('');
    const [doctorOperations, setDoctorOperations] = useState({
        appointments: [],
        sessions: [],
        prescriptions: []
    });

    const [processingId, setProcessingId] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVerificationDoctorId, setSelectedVerificationDoctorId] = useState('');

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const queryString = router.asPath.split('?')[1] || '';
        const params = new URLSearchParams(queryString);
        const tabFromQuery = params.get('tab');
        const nextTab = tabFromQuery && ADMIN_TABS.includes(tabFromQuery) ? tabFromQuery : 'overview';

        if (nextTab !== activeTab) {
            setActiveTab(nextTab);
        }
    }, [router.isReady, router.asPath, activeTab]);

    const fetchDashboardData = async ({ initialLoad = false } = {}) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            setError('');

            const [
                usersRes,
                pendingRes,
                paymentRes,
                doctorDirectoryRes,
                patientRes
            ] = await Promise.allSettled([
                adminApi.get('/users'),
                adminApi.get('/doctors/pending'),
                paymentApi.get('/admin/summary'),
                doctorApi.get('/all'),
                patientApi.get('')
            ]);

            const nextUsers = usersRes.status === 'fulfilled' ? extractListData(usersRes.value) : [];
            const nextPending = pendingRes.status === 'fulfilled' ? extractListData(pendingRes.value) : [];
            const nextDoctorDirectory = doctorDirectoryRes.status === 'fulfilled' ? extractListData(doctorDirectoryRes.value) : [];
            const nextPatients = patientRes.status === 'fulfilled' ? extractListData(patientRes.value) : [];
            const nextPaymentSummary = paymentRes.status === 'fulfilled' ? extractObjectData(paymentRes.value) : {};

            setUsers(nextUsers);
            setPendingDoctors(nextPending);
            setDoctorDirectory(nextDoctorDirectory);
            setPatients(nextPatients);
            setPaymentSummary({
                total: nextPaymentSummary.total || 0,
                success: nextPaymentSummary.success || 0,
                failed: nextPaymentSummary.failed || 0,
                pending: nextPaymentSummary.pending || 0,
                refunded: nextPaymentSummary.refunded || 0,
                totalRevenue: nextPaymentSummary.totalRevenue || 0
            });

            setServiceHealth((prev) => ({
                ...prev,
                admin: usersRes.status === 'fulfilled' && pendingRes.status === 'fulfilled',
                payments: paymentRes.status === 'fulfilled',
                doctors: doctorDirectoryRes.status === 'fulfilled',
                patients: patientRes.status === 'fulfilled'
            }));

            if (
                usersRes.status !== 'fulfilled'
                && pendingRes.status !== 'fulfilled'
                && paymentRes.status !== 'fulfilled'
                && doctorDirectoryRes.status !== 'fulfilled'
                && patientRes.status !== 'fulfilled'
            ) {
                setError('Unable to reach backend services. Verify api-gateway and microservices are running.');
            }
        } catch (err) {
            console.error('Failed to load admin dashboard data', err);
            setError('Unable to load admin data right now. Please try again.');
        } finally {
            if (initialLoad) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const role = localStorage.getItem('user_role');
        if (role !== 'ADMIN') {
            router.push('/login');
            return;
        }

        fetchDashboardData({ initialLoad: true });
    }, [router]);

    useEffect(() => {
        if (selectedDoctorId || doctorDirectory.length === 0) {
            return;
        }

        const firstDoctor = doctorDirectory[0];
        if (firstDoctor?.id) {
            setSelectedDoctorId(String(firstDoctor.id));
        }
    }, [doctorDirectory, selectedDoctorId]);

    const fetchDoctorOperations = async (doctorId) => {
        if (!doctorId) {
            return;
        }

        try {
            setOperationsLoading(true);
            setOperationsError('');

            const [appointmentRes, sessionRes, prescriptionRes] = await Promise.allSettled([
                appointmentApi.get(`/doctor/${doctorId}`),
                telemedicineApi.get(`/sessions/doctor/${doctorId}`),
                prescriptionApi.get(`/doctor/${doctorId}`)
            ]);

            setDoctorOperations({
                appointments: appointmentRes.status === 'fulfilled' ? extractListData(appointmentRes.value) : [],
                sessions: sessionRes.status === 'fulfilled' ? extractListData(sessionRes.value) : [],
                prescriptions: prescriptionRes.status === 'fulfilled' ? extractListData(prescriptionRes.value) : []
            });

            setServiceHealth((prev) => ({
                ...prev,
                appointments: appointmentRes.status === 'fulfilled',
                telemedicine: sessionRes.status === 'fulfilled',
                prescriptions: prescriptionRes.status === 'fulfilled'
            }));

            if (
                appointmentRes.status !== 'fulfilled'
                && sessionRes.status !== 'fulfilled'
                && prescriptionRes.status !== 'fulfilled'
            ) {
                setOperationsError('Unable to load doctor operations from appointments, telemedicine, and prescriptions services.');
            }
        } catch (err) {
            console.error('Failed to load doctor operations', err);
            setOperationsError('Failed to load doctor operations. Please try again.');
        } finally {
            setOperationsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'operations' || !selectedDoctorId) {
            return;
        }

        fetchDoctorOperations(selectedDoctorId);
    }, [activeTab, selectedDoctorId]);

    const stats = useMemo(() => {
        const doctors = users.filter((u) => u.role === 'DOCTOR');
        const patients = users.filter((u) => u.role === 'PATIENT');
        const activeUsers = users.filter((u) => u.isActive).length;

        return {
            totalUsers: users.length,
            totalDoctors: doctors.length,
            totalPatients: patients.length,
            activeUsers,
            doctorProfiles: doctorDirectory.length,
            patientRegistry: patients.length,
            pendingVerifications: pendingDoctors.length,
            totalRevenue: Number(paymentSummary.totalRevenue || 0)
        };
    }, [users, pendingDoctors, paymentSummary, doctorDirectory, patients]);

    const filteredPendingDoctors = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return pendingDoctors;
        }

        return pendingDoctors.filter((doctor) => {
            const text = [
                doctor.firstName,
                doctor.lastName,
                doctor.username,
                doctor.email,
                String(doctor.id || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [pendingDoctors, searchTerm]);

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return users;
        }

        return users.filter((user) => {
            const text = [
                user.firstName,
                user.lastName,
                user.username,
                user.email,
                user.role,
                String(user.id || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [users, searchTerm]);

    const filteredDoctorDirectory = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return doctorDirectory;
        }

        return doctorDirectory.filter((doctor) => {
            const linkedUser = users.find((u) => u.id === doctor.userId);
            const text = [
                doctor.specialization,
                doctor.qualifications,
                doctor.licenseNumber,
                doctor.verificationStatus,
                linkedUser?.firstName,
                linkedUser?.lastName,
                linkedUser?.email,
                linkedUser?.username,
                String(doctor.id || ''),
                String(doctor.userId || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [doctorDirectory, users, searchTerm]);

    const filteredPatients = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return patients;
        }

        return patients.filter((patient) => {
            const text = [
                patient.name,
                patient.email,
                patient.phone,
                patient.gender,
                patient.bloodGroup,
                String(patient.id || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [patients, searchTerm]);

    const pendingDoctorProfileByUserId = useMemo(() => {
        const map = new Map();
        doctorDirectory.forEach((doctor) => {
            if (doctor?.userId) {
                map.set(String(doctor.userId), doctor);
            }
        });
        return map;
    }, [doctorDirectory]);

    const mergedPendingDoctors = useMemo(() => {
        return filteredPendingDoctors
            .map((doctorUser) => {
                const profile = pendingDoctorProfileByUserId.get(String(doctorUser.id)) || null;
                console.log('Merging doctor:', doctorUser.id, 'with profile:', profile);
                return {
                    ...doctorUser,
                    doctorProfile: profile
                };
            });
    }, [filteredPendingDoctors, pendingDoctorProfileByUserId]);

    const selectedPendingDoctor = useMemo(() => {
        if (!selectedVerificationDoctorId) {
            return mergedPendingDoctors[0] || null;
        }

        return mergedPendingDoctors.find((doctor) => String(doctor.id) === String(selectedVerificationDoctorId)) || mergedPendingDoctors[0] || null;
    }, [mergedPendingDoctors, selectedVerificationDoctorId]);

    const selectedDoctorDocuments = useMemo(() => {
        const profile = selectedPendingDoctor?.doctorProfile;
        if (!profile) {
            return [];
        }

        const docs = [];
        const pushIfPresent = (label, value) => {
            if (value) {
                docs.push({ label, value: String(value) });
            }
        };

        pushIfPresent('Profile Photo', profile.profileImageUrl);
        pushIfPresent('License Document', profile.licenseDocumentUrl || profile.licenseDocumentUrl || profile.medicalLicenseUrl || profile.licenseFileUrl || profile.licenseUrl);

        if (Array.isArray(profile.documents)) {
            profile.documents.forEach((doc, idx) => {
                if (doc?.url) {
                    docs.push({
                        label: doc.type || `Document ${idx + 1}`,
                        value: String(doc.url)
                    });
                }
            });
        }

        return docs;
    }, [selectedPendingDoctor]);

    useEffect(() => {
        if (activeTab !== 'verifications') {
            return;
        }

        if (!selectedVerificationDoctorId && mergedPendingDoctors.length > 0) {
            setSelectedVerificationDoctorId(String(mergedPendingDoctors[0].id));
        }
    }, [activeTab, mergedPendingDoctors, selectedVerificationDoctorId]);

    const verifyDoctor = async (doctorId, status) => {
        try {
            setProcessingId(doctorId);

            if (status === 'REJECTED') {
                const reason = window.prompt('Enter rejection reason:') || '';
                if (!reason.trim()) {
                    return;
                }

                await adminApi.put(`/doctors/${doctorId}/verify`, {
                    status: 'REJECTED',
                    rejectionReason: reason.trim()
                });
            } else {
                await adminApi.put(`/doctors/${doctorId}/verify`, {
                    status: 'APPROVED'
                });
            }

            await fetchDashboardData({ initialLoad: false });
        } catch (err) {
            console.error(`Failed to ${status.toLowerCase()} doctor`, err);
            setError(`Failed to ${status.toLowerCase()} doctor. Please try again.`);
        } finally {
            setProcessingId(null);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            setProcessingId(userId);
            await adminApi.put(`/users/${userId}/toggle-status`);
            await fetchDashboardData({ initialLoad: false });
        } catch (err) {
            console.error('Failed to toggle user status', err);
            setError('Failed to update user status. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading admin command center..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title="Admin Control Center"
                subtitle="Govern users, verify doctors, and monitor platform revenue from one place."
                breadcrumbs={[
                    { label: 'Dashboard' },
                    { label: 'Admin' }
                ]}
                actions={(
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            icon={RefreshCw}
                            loading={refreshing}
                            onClick={() => fetchDashboardData({ initialLoad: false })}
                        >
                            Refresh
                        </Button>
                    </div>
                )}
            />

            {error && (
                <Card padding="md" className="border-l-4 border-l-rose-600 bg-rose-50 mb-8">
                    <p className="text-sm font-semibold text-rose-700">{error}</p>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label="Registered Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                    trend={{ value: 'Live', isPositive: true }}
                />
                <StatCard
                    label="Pending Doctor Verification"
                    value={stats.pendingVerifications}
                    icon={ShieldCheck}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                    trend={{
                        value: stats.pendingVerifications > 0 ? 'Action Needed' : 'Clear',
                        isPositive: stats.pendingVerifications === 0
                    }}
                />
                <StatCard
                    label="Active Accounts"
                    value={stats.activeUsers}
                    icon={Activity}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    trend={{ value: 'Healthy', isPositive: true }}
                />
                <StatCard
                    label="Revenue (Success Payments)"
                    value={formatMoney(stats.totalRevenue)}
                    icon={CreditCard}
                    color="text-sky-600"
                    bgColor="bg-sky-50"
                    trend={{ value: 'Finance', isPositive: true }}
                />
            </div>

            <Card
                title="Admin Workspace"
                subtitle="Switch between verification, user governance, and financial overview"
                padding="md"
                actions={(
                    <div className="w-full sm:w-auto flex items-center bg-slate-100/80 rounded-2xl px-4 py-2.5 border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search doctors, users, email, role..."
                            className="bg-transparent border-none outline-none text-xs font-bold px-3 w-full sm:w-72 placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            >
                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'verifications', label: 'Doctor Verification' },
                        { id: 'doctors', label: 'Doctor Directory' },
                        { id: 'users', label: 'User Management' },
                        { id: 'financials', label: 'Financials' }
                    ].map((tab) => (
                        <Button
                            key={tab.id}
                            size="sm"
                            variant={activeTab === tab.id ? 'primary' : 'secondary'}
                            onClick={() => {
                                setActiveTab(tab.id);
                                router.replace(
                                    {
                                        pathname: '/dashboard/admin',
                                        query: tab.id === 'overview' ? {} : { tab: tab.id }
                                    },
                                    undefined,
                                    { shallow: true }
                                );
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card padding="md" className="bg-slate-50 border-slate-200">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3">Platform Summary</h3>
                            <div className="space-y-3 text-sm text-slate-600 font-semibold">
                                <p className="flex justify-between"><span>Doctors</span><span>{stats.totalDoctors}</span></p>
                                <p className="flex justify-between"><span>Patients</span><span>{stats.totalPatients}</span></p>
                                <p className="flex justify-between"><span>Pending Verifications</span><span>{stats.pendingVerifications}</span></p>
                                <p className="flex justify-between"><span>Revenue</span><span>{formatMoney(stats.totalRevenue)}</span></p>
                            </div>
                        </Card>

                        <Card padding="md" className="bg-slate-50 border-slate-200">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3">Payment Breakdown</h3>
                            <div className="space-y-3 text-sm text-slate-600 font-semibold">
                                <p className="flex justify-between"><span>Total Payments</span><span>{paymentSummary.total || 0}</span></p>
                                <p className="flex justify-between"><span>Success</span><span>{paymentSummary.success || 0}</span></p>
                                <p className="flex justify-between"><span>Pending</span><span>{paymentSummary.pending || 0}</span></p>
                                <p className="flex justify-between"><span>Failed</span><span>{paymentSummary.failed || 0}</span></p>
                                <p className="flex justify-between"><span>Refunded</span><span>{paymentSummary.refunded || 0}</span></p>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'verifications' && (
                    <div className="space-y-6">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left min-w-[980px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Doctor</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Specialization</th>
                                    <th className="px-6 py-4">License</th>
                                    <th className="px-6 py-4">Current Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mergedPendingDoctors.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center text-slate-500 font-semibold">
                                            No pending doctors found.
                                        </td>
                                    </tr>
                                )}

                                {mergedPendingDoctors.map((doctor) => (
                                    <tr 
                                        key={doctor.id} 
                                        className={`hover:bg-indigo-50/50 cursor-pointer transition-all border-l-4 ${selectedVerificationDoctorId === String(doctor.id) ? 'bg-indigo-50/70 border-l-indigo-500' : 'border-l-transparent'}`}
                                        onClick={() => setSelectedVerificationDoctorId(String(doctor.id))}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {getUserLabel(doctor)}
                                            {!doctor.doctorProfile && <span className="ml-2 text-[10px] text-rose-500 font-black uppercase tracking-tighter bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">No Profile In DB</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{doctor.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{doctor.doctorProfile?.specialization || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-black text-indigo-500">{doctor.doctorProfile?.licenseNumber || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full w-fit border border-amber-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Under Review</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="xs"
                                                    variant="primary"
                                                    className="font-black px-4 shadow-sm"
                                                    icon={CheckCircle2}
                                                    loading={processingId === doctor.id}
                                                    onClick={() => verifyDoctor(doctor.id, 'APPROVED')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="danger"
                                                    className="font-black px-4 shadow-sm"
                                                    icon={AlertCircle}
                                                    loading={processingId === doctor.id}
                                                    onClick={() => verifyDoctor(doctor.id, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedPendingDoctor && (
                        <Card
                            title="Verification Review"
                            subtitle="Full profile and submitted documents in one place"
                            padding="md"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3 font-extrabold">Doctor Identification</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl overflow-hidden shadow-inner">
                                            {selectedPendingDoctor.doctorProfile?.profileImageUrl ? (
                                                <img src={selectedPendingDoctor.doctorProfile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                getUserLabel(selectedPendingDoctor).charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg leading-tight">{getUserLabel(selectedPendingDoctor)}</p>
                                            <p className="text-slate-500 font-bold text-sm mt-0.5">{selectedPendingDoctor.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3 font-extrabold">Professional Credentials</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Specialization</p>
                                                <p className="text-slate-900 font-bold text-sm">{selectedPendingDoctor.doctorProfile?.specialization || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">License ID</p>
                                                <p className="text-indigo-600 font-black text-sm">{selectedPendingDoctor.doctorProfile?.licenseNumber || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3 font-extrabold">Account Status</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <p className="text-slate-900 font-black text-sm uppercase tracking-tight">
                                                {selectedPendingDoctor.doctorProfile?.verificationStatus?.replace(/_/g, ' ') || 'PENDING'}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5 underline">Consultation Fee</p>
                                        <p className="text-slate-900 font-bold text-sm">{formatMoney(selectedPendingDoctor.doctorProfile?.consultationFee)}</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2 xl:col-span-3 p-5 rounded-2xl border border-slate-200 bg-slate-50 border-l-4 border-l-indigo-500">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2 font-extrabold">Professional Bio</p>
                                    <p className="text-slate-700 italic font-medium leading-relaxed">
                                        "{selectedPendingDoctor.doctorProfile?.bio || 'No bio submitted.'}"
                                    </p>
                                </div>
                                <div className="md:col-span-2 xl:col-span-3 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Document Previews</p>
                                    {selectedDoctorDocuments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedDoctorDocuments.map((doc, idx) => (
                                                <div key={`${doc.label}-${idx}`} className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-700 font-bold text-sm">{doc.label}</span>
                                                        <a 
                                                            href={doc.value} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2"
                                                        >
                                                            View Original
                                                        </a>
                                                    </div>
                                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 group shadow-inner flex items-center justify-center">
                                                        {doc.value.toLowerCase().endsWith('.pdf') ? (
                                                            <div className="flex flex-col items-center gap-2 p-6 text-center">
                                                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-2">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">PDF Document</span>
                                                                <p className="text-[10px] text-slate-400 font-medium px-4">Browser preview for PDFs is restricted. Click "View Original" to open.</p>
                                                            </div>
                                                        ) : (
                                                            <img 
                                                                src={doc.value} 
                                                                alt={doc.label}
                                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://placehold.co/600x400/f8fafc/64748b?text=Preview+Not+Available';
                                                                }}
                                                            />
                                                        )}
                                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors pointer-events-none" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                            <p className="text-slate-500 font-medium">No documents have been uploaded for this doctor yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'doctors') && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">{activeTab === 'doctors' ? 'Doctor' : 'User'}</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-14 text-center text-slate-500 font-semibold">
                                            {activeTab === 'doctors' ? 'No matching doctors found.' : 'No matching users found.'}
                                        </td>
                                    </tr>
                                )}

                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{getUserLabel(user)}</div>
                                            <div className="text-xs font-semibold text-slate-500 mt-1">{user.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info" size="sm">{user.role || 'N/A'}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                                                {user.isActive ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                icon={UserCog}
                                                loading={processingId === user.id}
                                                onClick={() => toggleUserStatus(user.id)}
                                            >
                                                {user.isActive ? 'Disable' : 'Enable'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Payments', value: paymentSummary.total || 0 },
                            { label: 'Successful Payments', value: paymentSummary.success || 0 },
                            { label: 'Pending Payments', value: paymentSummary.pending || 0 },
                            { label: 'Failed Payments', value: paymentSummary.failed || 0 },
                            { label: 'Refunded Payments', value: paymentSummary.refunded || 0 },
                            { label: 'Total Revenue', value: formatMoney(paymentSummary.totalRevenue || 0) }
                        ].map((item) => (
                            <div key={item.label} className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{item.label}</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </DashboardLayout>
);
};

export default AdminDashboard;
