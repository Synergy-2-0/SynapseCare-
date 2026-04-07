import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { appointmentApi, doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import EncounterWorkspace from '@/components/doctor/EncounterWorkspace';
import { Clock, Activity, Plus, ChevronRight, ChevronLeft, CheckCircle, XCircle, Video, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a "yyyy-MM-dd" string safely without timezone shifts */
const parseLocalDate = (str) => {
    if (!str) return null;
    const [y, m, d] = String(str).split('-').map(Number);
    return new Date(y, m - 1, d);
};

const formatDateLabel = (str) => {
    const d = parseLocalDate(str);
    return d ? format(d, 'MMM d') : str;
};

const STATUS_COLORS = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-teal-100 text-teal-800 border-teal-200',
    PAID: 'bg-teal-100 text-teal-800 border-teal-200',
    IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
    COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
    MISSED: 'bg-rose-100 text-rose-800 border-rose-200',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
    REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
    BLOCKED: 'bg-slate-800 text-white border-slate-900',
};

const DOT_COLORS = {
    PENDING: 'bg-amber-400 animate-pulse',
    PENDING_PAYMENT: 'bg-amber-400 animate-pulse',
    CONFIRMED: 'bg-teal-500',
    PAID: 'bg-teal-500',
    IN_PROGRESS: 'bg-green-500 animate-pulse',
    COMPLETED: 'bg-gray-400',
    MISSED: 'bg-rose-500',
    CANCELLED: 'bg-rose-500',
    REJECTED: 'bg-rose-500',
    BLOCKED: 'bg-slate-700',
};

// ─── Component ─────────────────────────────────────────────────────────────────

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [patientsMap, setPatientsMap] = useState({});   // patientId -> PatientClientDto
    const [loading, setLoading] = useState(true);
    const [actionIds, setActionIds] = useState([]);   // IDs currently being acted on
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);    // scroll calendar by weeks
    const [doctorDbId, setDoctorDbId] = useState(null); // doctor service internal PK
    const [activePostSession, setActivePostSession] = useState(null);
    const router = useRouter();

    // ── Fetch data ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const role = localStorage.getItem('user_role');
        const uid = localStorage.getItem('user_id'); // auth userId

        if (role !== 'DOCTOR') { router.push('/login'); return; }

        const fetchData = async () => {
            try {
                // 1. Verify doctor is approved & grab internal DB id from profile
                const profileRes = await doctorApi.get('/profile/me');
                const profile = profileRes.data;

                if (!isDoctorApproved(profile?.verificationStatus)) {
                    router.replace('/doctor/setup');
                    return;
                }

                // The profile's `id` field is the doctor service's internal PK (e.g. 3883)
                // which is what appointment-service uses as doctorId in its table.
                const dbId = profile?.id || uid;
                setDoctorDbId(dbId);

                // 2. Fetch all appointments for this doctor (by DB pk)
                const apptRes = await appointmentApi.get(`/doctor/${dbId}`);
                const rawAppts = apptRes.data?.data || apptRes.data || [];
                const appts = Array.isArray(rawAppts) ? rawAppts : [];
                setAppointments(appts);

                // 3. Fetch patient details to resolve names
                if (appts.length > 0) {
                    try {
                        const patRes = await appointmentApi.get(`/doctor/${dbId}/patients`);
                        const patList = patRes.data?.data || [];
                        const map = {};
                        patList.forEach(p => { if (p?.id) map[p.id] = p; });
                        setPatientsMap(map);
                    } catch (patErr) {
                        console.warn('Could not load patient names:', patErr.message);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch appointments:', err);
                toast.error('Could not load clinical roster');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // ── Accept / Reject ─────────────────────────────────────────────────────────
    const handleAction = useCallback(async (apptId, action) => {
        setActionIds(prev => [...prev, apptId]);
        try {
            await appointmentApi.put(`/${apptId}/${action}`);
            setAppointments(prev => prev.map(a =>
                a.id === apptId
                    ? { ...a, status: action === 'accept' ? 'CONFIRMED' : 'REJECTED' }
                    : a
            ));
            toast.success(action === 'accept' ? 'Appointment confirmed ✓' : 'Appointment rejected');
        } catch (err) {
            console.error('Action failed:', err);
            toast.error('Could not update appointment status');
        } finally {
            setActionIds(prev => prev.filter(id => id !== apptId));
        }
    }, []);

    // ── Derived data ────────────────────────────────────────────────────────────
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthAppts = appointments.filter(a => {
        const d = parseLocalDate(a.date);
        return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const totalCount = monthAppts.length;
    const pendingCount = monthAppts.filter(a => a.status === 'PENDING').length;
    const doneCount = monthAppts.filter(a => a.status === 'COMPLETED').length;

    // Calendar strip — 14 days starting from selected week
    const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 0 });
    const calendarDays = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

    // Appointments with dot indicators for each calendar day
    const hasDots = (date) =>
        appointments.some(a => {
            const d = parseLocalDate(a.date);
            return d && isSameDay(d, date) && a.status !== 'CANCELLED' && a.status !== 'REJECTED';
        });

    // Timeline = non-pending appts for the selected day, sorted by time
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const timelineAppointments = appointments
        .filter(a =>
            a.date === selectedDateStr &&
            a.status !== 'PENDING' &&
            a.status !== 'REJECTED' &&
            a.status !== 'CANCELLED'
        )
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    // Pending requests (right column)
    const pendingRequests = appointments.filter(a => a.status === 'PENDING');

    // ── Patient name helper ─────────────────────────────────────────────────────
    const patientName = (patientId) =>
        patientsMap[patientId]?.name || `Patient #${patientId}`;

    const patientInitial = (patientId) =>
        (patientsMap[patientId]?.name?.[0] || 'P').toUpperCase();

    // ── Render ──────────────────────────────────────────────────────────────────
    if (loading) return (
        <DashboardLayout title="Appointments">
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
                    <p className="text-slate-500 font-medium text-sm">Loading clinical roster…</p>
                </div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="Appointments">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Banner */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-3xl p-8 flex items-start justify-between overflow-hidden relative min-h-[160px]">
                        <div className="z-10">
                            <h2 className="text-2xl font-sans text-slate-800 font-bold leading-tight">
                                Add appointment in<br />your schedule now
                            </h2>
                            <button className="mt-5 flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-teal-500/20 active:scale-95">
                                <Plus size={16} /> Add Appointment
                            </button>
                        </div>
                        <div className="absolute right-4 bottom-0 opacity-60 pointer-events-none select-none">
                            <img
                                src="https://api.dicebear.com/7.x/notionists/svg?seed=doctor-team&backgroundColor=transparent"
                                alt="Illustration"
                                className="w-52 h-52"
                            />
                        </div>
                    </div>

                    {/* Calendar strip */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-slate-800 text-lg">Calendar</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-600">
                                    {format(selectedDate, 'MMM yyyy')}
                                </span>
                                <button
                                    onClick={() => setWeekOffset(w => w - 1)}
                                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft size={14} className="text-slate-500" />
                                </button>
                                <button
                                    onClick={() => setWeekOffset(w => w + 1)}
                                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight size={14} className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-3">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[10px] uppercase tracking-wider text-slate-400 font-bold py-1">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((date, idx) => {
                                const isSelected = isSameDay(date, selectedDate);
                                const isToday = isSameDay(date, new Date());
                                const hasEvents = hasDots(date);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
                                        className={`relative flex flex-col items-center justify-center py-3 rounded-2xl transition-all text-sm font-bold
                                            ${isSelected
                                                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                                                : isToday
                                                    ? 'bg-teal-50 text-teal-600 border border-teal-200'
                                                    : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        {format(date, 'd')}
                                        {hasEvents && (
                                            <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-400'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Timeline</h3>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                {format(selectedDate, 'EEEE, MMM d')}
                            </span>
                        </div>

                        {timelineAppointments.length > 0 ? (
                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-slate-100" />

                                <div className="space-y-4">
                                    {timelineAppointments.map((appt) => (
                                        <div key={appt.id} className="flex gap-4 items-start group">
                                            {/* Time label */}
                                            <div className="w-[4rem] pt-4 text-right shrink-0">
                                                <p className="text-xs font-bold text-slate-500 tabular-nums">
                                                    {appt.time ? String(appt.time).substring(0, 5) : '??:??'}
                                                </p>
                                            </div>

                                            {/* Dot on timeline */}
                                            <div className="relative flex items-start pt-3.5 shrink-0">
                                                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${DOT_COLORS[appt.status] || 'bg-slate-300'}`} />
                                            </div>

                                            {/* Card */}
                                            <div className="flex-1 pb-4">
                                                <div className="bg-slate-50 border border-slate-100 hover:border-teal-200 hover:shadow-sm p-4 rounded-2xl transition-all cursor-default">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm shrink-0 border border-teal-200">
                                                                {patientInitial(appt.patientId)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm leading-tight">
                                                                    {patientName(appt.patientId)}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                                    {appt.reason || 'Regular clinical consultation'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {/* Consultation type badge */}
                                                            {appt.consultationType === 'TELEMEDICINE' ? (
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                                    <Video size={9} /> Tele
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                                    <User size={9} /> In-Person
                                                                </span>
                                                            )}
                                                            {/* Status */}
                                                            <span className={`text-[10px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                                {appt.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Token number & fee */}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            Token #{appt.tokenNumber ?? '–'}
                                                            {appt.fee ? ` · ₹${appt.fee}` : ''}
                                                        </span>
                                                        <div className="flex gap-4 items-center">
                                                            {appt.consultationType === 'TELEMEDICINE' && (
                                                                <button
                                                                    type="button"
                                                                    className="text-[10px] font-bold text-teal-500 hover:text-teal-600 flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-md"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        router.push(`/telemedicine?appointmentId=${appt.id}`);
                                                                    }}
                                                                >
                                                                    <Video size={10} /> Join Call
                                                                </button>
                                                            )}
                                                            {appt.status !== 'COMPLETED' && (
                                                                <button
                                                                    onClick={() => setActivePostSession(appt)}
                                                                    className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 transition-colors px-2 py-1 rounded-md"
                                                                >
                                                                    Start Session <ChevronRight size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-14">
                                <Clock size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-500 font-bold text-sm">
                                    No scheduled appointments for {format(selectedDate, 'MMMM d, yyyy')}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">Select another day or check pending requests →</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
                <div className="space-y-6">

                    {/* Stats */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest mb-5">This Month</h3>
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">Total Appointments</p>
                                <p className="text-4xl font-sans font-black text-slate-800 tabular-nums">{totalCount}</p>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">Pending</p>
                                <p className="text-4xl font-sans font-black text-rose-500 tabular-nums">{pendingCount}</p>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-1">Completed</p>
                                <p className="text-4xl font-sans font-black text-emerald-500 tabular-nums">{doneCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-slate-800 text-base">
                                Appointment Requests
                                {pendingRequests.length > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-black bg-rose-500 text-white rounded-full">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </h3>
                        </div>

                        <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-1 custom-scrollbar">
                            {pendingRequests.length > 0 ? pendingRequests.map(appt => {
                                const isActing = actionIds.includes(appt.id);
                                return (
                                    <div
                                        key={appt.id}
                                        className="p-4 border border-slate-100 rounded-2xl hover:border-teal-100 hover:bg-slate-50/50 transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            {/* Patient info */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm shrink-0 border border-teal-200">
                                                    {patientInitial(appt.patientId)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm truncate">
                                                        {patientName(appt.patientId)}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {appt.reason || 'Regular consultation'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date / time */}
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-bold text-slate-700 tabular-nums">
                                                    {appt.time ? String(appt.time).substring(0, 5) : '—'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {formatDateLabel(appt.date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Consultation type */}
                                        <div className="flex items-center gap-1.5 mb-3">
                                            {appt.consultationType === 'TELEMEDICINE' ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                    <Video size={9} /> Telemedicine
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                    <User size={9} /> In-Person
                                                </span>
                                            )}
                                            {appt.fee && (
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    ₹{appt.fee}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(appt.id, 'accept')}
                                                disabled={isActing}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isActing ? (
                                                    <div className="w-3 h-3 border border-teal-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle size={12} />
                                                )}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleAction(appt.id, 'reject')}
                                                disabled={isActing}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isActing ? (
                                                    <div className="w-3 h-3 border border-rose-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <XCircle size={12} />
                                                )}
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-12 opacity-50">
                                    <Activity size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-500">All clear — no pending requests</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activePostSession && (
                <EncounterWorkspace
                    session={activePostSession}
                    doctorId={doctorDbId}
                    onClose={() => {
                        setActivePostSession(null);
                        // Refresh data silently to show status update
                        appointmentApi.get(`/doctor/${doctorDbId}`).then(res => {
                            const rawAppts = res.data?.data || res.data || [];
                            setAppointments(Array.isArray(rawAppts) ? rawAppts : []);
                        });
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default AppointmentsPage;
