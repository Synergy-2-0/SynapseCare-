import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { appointmentApi, telemedicineApi } from '../../lib/api';
import {
    Video,
    Calendar,
    Clock,
    User,
    Activity,
    CheckCircle2,
    AlertCircle,
    Play,
    FileText,
    Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientTelemedicineCenter = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [sessions, setSessions] = useState({});
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userId = localStorage.getItem('user_id');

            // Fetch patient's appointments
            const apptRes = await appointmentApi.get(`/patient/${userId}`);
            const allAppts = apptRes.data.data || [];

            // Filter telemedicine appointments
            const telemedicineAppts = allAppts.filter(a =>
                a.consultationType === 'ONLINE' || a.consultationType === 'TELEMEDICINE'
            );

            setAppointments(telemedicineAppts);

            // Fetch sessions for each appointment
            const sessionPromises = telemedicineAppts.map(async (appt) => {
                try {
                    const sessionRes = await telemedicineApi.get(`/sessions/appointment/${appt.id}`);
                    return { appointmentId: appt.id, session: sessionRes.data.data };
                } catch (err) {
                    return { appointmentId: appt.id, session: null };
                }
            });

            const sessionResults = await Promise.all(sessionPromises);
            const sessionsMap = {};
            sessionResults.forEach(({ appointmentId, session }) => {
                sessionsMap[appointmentId] = session;
            });
            setSessions(sessionsMap);

        } catch (err) {
            console.error('Failed to fetch telemedicine data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async (appointmentId) => {
        const session = sessions[appointmentId];
        if (!session) {
            alert('Session not yet created. Please wait for the doctor to start the session.');
            return;
        }

        // Navigate to telemedicine page
        router.push(`/telemedicine?appointmentId=${appointmentId}`);
    };

    const canJoinSession = (appointment) => {
        // Allow joining 1 hour before appointment time
        if (!appointment.date || !appointment.time) return false;

        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const now = new Date();
        const hourBefore = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);

        return now >= hourBefore && appointment.status !== 'CANCELLED';
    };

    const upcomingAppointments = appointments.filter(a =>
        (a.status === 'CONFIRMED' || a.status === 'PAID') &&
        (!sessions[a.id] || sessions[a.id].status !== 'ENDED')
    );

    const completedAppointments = appointments.filter(a =>
        a.status === 'COMPLETED' || (sessions[a.id] && sessions[a.id].status === 'ENDED')
    );

    const activeAppointments = upcomingAppointments.filter(a =>
        sessions[a.id] && sessions[a.id].status === 'IN_SESSION'
    );

    if (loading) return <LoadingSpinner size="fullscreen" message="Loading Telemedicine Center..." />;

    return (
        <DashboardLayout>
            <Header
                title="Telemedicine Center"
                subtitle="Your Virtual Consultations"
                actions={
                    <div className="flex items-center gap-4">
                        {activeAppointments.length > 0 && (
                            <Badge variant="success" pulse>
                                {activeAppointments.length} Active Session{activeAppointments.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                }
            />

            <div className="p-8 space-y-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'upcoming'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            Upcoming Sessions ({upcomingAppointments.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'completed'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            Past Sessions ({completedAppointments.length})
                        </div>
                    </button>
                </div>

                {/* Active Session Alert */}
                {activeAppointments.length > 0 && (
                    <Card className="border-l-4 border-emerald-500 bg-emerald-50">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Monitor size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-emerald-900">
                                        Active Consultation in Progress
                                    </h3>
                                    <p className="text-sm text-emerald-700">
                                        Your doctor is ready. Click below to rejoin the session.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                icon={Play}
                                onClick={() => handleJoinSession(activeAppointments[0].id)}
                            >
                                Rejoin Now
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Upcoming Sessions Tab */}
                {activeTab === 'upcoming' && (
                    <div className="grid gap-4">
                        {upcomingAppointments.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Video size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">
                                    No Upcoming Telemedicine Sessions
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    Book a telemedicine consultation to see your sessions here.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => router.push('/book-appointment')}
                                >
                                    Book Consultation
                                </Button>
                            </Card>
                        ) : (
                            upcomingAppointments.map(appt => (
                                <Card key={appt.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <User size={24} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900">
                                                    Dr. {appt.doctorName || `Doctor #${appt.doctorId}`}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {appt.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {appt.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {sessions[appt.id] ? (
                                                sessions[appt.id].status === 'IN_SESSION' ? (
                                                    <Badge variant="success" pulse>Live Now</Badge>
                                                ) : (
                                                    <Badge variant="info">Session Ready</Badge>
                                                )
                                            ) : (
                                                <Badge variant="secondary">Waiting for Doctor</Badge>
                                            )}

                                            {canJoinSession(appt) && sessions[appt.id] ? (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    icon={Play}
                                                    onClick={() => handleJoinSession(appt.id)}
                                                >
                                                    {sessions[appt.id].status === 'IN_SESSION' ? 'Join Now' : 'Join Session'}
                                                </Button>
                                            ) : (
                                                <Button variant="secondary" size="sm" disabled>
                                                    {sessions[appt.id] ? 'Not Yet Available' : 'Waiting'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {appt.reason && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <p className="text-sm text-slate-600">
                                                <strong>Consultation Reason:</strong> {appt.reason}
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Completed Sessions Tab */}
                {activeTab === 'completed' && (
                    <div className="grid gap-4">
                        {completedAppointments.length === 0 ? (
                            <Card className="p-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">
                                    No Past Sessions
                                </h3>
                                <p className="text-slate-600">
                                    Your completed telemedicine consultations will appear here.
                                </p>
                            </Card>
                        ) : (
                            completedAppointments.map(appt => {
                                const session = sessions[appt.id];
                                return (
                                    <Card key={appt.id} className="p-6 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                                    <CheckCircle2 size={24} className="text-slate-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-900">
                                                        Dr. {appt.doctorName || `Doctor #${appt.doctorId}`}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {appt.date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {appt.time}
                                                        </span>
                                                    </div>
                                                    {session && session.endedAt && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Completed: {new Date(session.endedAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Badge variant="secondary">Completed</Badge>
                                                {session && session.notes && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        icon={FileText}
                                                        onClick={() => alert('View consultation notes:\n\n' + session.notes)}
                                                    >
                                                        View Notes
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PatientTelemedicineCenter;
