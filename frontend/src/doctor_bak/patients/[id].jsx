import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
    ArrowLeft,
    ClipboardList,
    Download,
    FileText,
    Pill,
    Stethoscope,
    Video,
    Clock,
    Calendar
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import {
    appointmentApi,
    caseApi,
    prescriptionApi,
    telemedicineApi
} from '../../../lib/api';
import { DOCTOR_ROUTES } from '../../../constants/routes';
import { formatDate, formatTime } from '../../../lib/utils';

const unwrapPayload = (response) => response?.data?.data ?? response?.data;

const statusVariant = (status) => {
    if (['COMPLETED', 'ACTIVE', 'APPROVED'].includes(status)) {
        return 'success';
    }

    if (['REJECTED', 'CANCELLED', 'EXPIRED'].includes(status)) {
        return 'danger';
    }

    if (['IN_PROGRESS', 'CONFIRMED', 'PAID', 'SCHEDULED'].includes(status)) {
        return 'info';
    }

    return 'warning';
};

const DoctorPatientDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [cases, setCases] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [sessions, setSessions] = useState([]);

    const patientId = useMemo(() => Number(id), [id]);

    const patientProfile = useMemo(() => {
        const fromCase = cases[0];
        const fromAppointment = appointments[0];
        const fromPrescription = prescriptions[0];

        return {
            id: patientId,
            name: fromCase?.patientName || fromAppointment?.patientName || fromPrescription?.patientName || `Patient #${patientId}`,
            age: fromCase?.patientAge || fromPrescription?.patientAge || null,
            gender: fromCase?.patientGender || fromPrescription?.patientGender || null
        };
    }, [appointments, cases, prescriptions, patientId]);

    const latestOpenAppointment = useMemo(() => {
        return appointments.find((appointment) => ['PENDING', 'CONFIRMED', 'PAID'].includes(appointment.status));
    }, [appointments]);

    useEffect(() => {
        const fetchPatientContext = async () => {
            if (!patientId) {
                return;
            }

            try {
                setLoading(true);
                setError('');

                const doctorId = localStorage.getItem('user_id');

                const [appointmentsResponse, casesResponse, prescriptionsResponse, sessionsResponse] = await Promise.all([
                    doctorId ? appointmentApi.get(`/doctor/${doctorId}`) : Promise.resolve({ data: [] }),
                    caseApi.get(`/patient/${patientId}/history`).catch(() => caseApi.get(`/patient/${patientId}`)),
                    prescriptionApi.get(`/patient/${patientId}`).catch(() => ({ data: [] })),
                    telemedicineApi.get(`/sessions/patient/${patientId}`).catch(() => ({ data: { data: [] } }))
                ]);

                const appointmentsPayload = unwrapPayload(appointmentsResponse);
                const patientAppointments = Array.isArray(appointmentsPayload)
                    ? appointmentsPayload
                        .map((appointment) => ({
                            ...appointment,
                            appointmentDate: appointment.appointmentDate || appointment.date,
                            appointmentTime: appointment.appointmentTime || appointment.time
                        }))
                        .filter((appointment) => Number(appointment.patientId) === patientId)
                        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                    : [];

                const casePayload = unwrapPayload(casesResponse);
                const patientCases = Array.isArray(casePayload)
                    ? [...casePayload].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : [];

                const prescriptionPayload = unwrapPayload(prescriptionsResponse);
                const patientPrescriptions = Array.isArray(prescriptionPayload)
                    ? [...prescriptionPayload].sort((a, b) => (b.id || 0) - (a.id || 0))
                    : [];

                const sessionsPayload = unwrapPayload(sessionsResponse);
                const patientSessions = Array.isArray(sessionsPayload)
                    ? [...sessionsPayload].sort((a, b) => new Date(b.scheduledStartTime) - new Date(a.scheduledStartTime))
                    : [];

                setAppointments(patientAppointments);
                setCases(patientCases);
                setPrescriptions(patientPrescriptions);
                setSessions(patientSessions);
            } catch (fetchError) {
                console.error('Failed to load patient details:', fetchError);
                setError('Unable to load patient history.');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientContext();
    }, [patientId]);

    const handleDownloadPrescription = async (prescriptionId) => {
        try {
            const response = await prescriptionApi.get(`/${prescriptionId}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prescription-${prescriptionId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (downloadError) {
            console.error('Failed to download prescription PDF:', downloadError);
            setError('Unable to download prescription PDF.');
        }
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading patient profile..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title={patientProfile.name}
                subtitle={`Patient ID: ${patientProfile.id}${patientProfile.age ? ` • Age ${patientProfile.age}` : ''}${patientProfile.gender ? ` • ${patientProfile.gender}` : ''}`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(DOCTOR_ROUTES.PATIENTS)}>
                            <ArrowLeft size={16} />
                            Back
                        </Button>
                        {latestOpenAppointment && (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    router.push({
                                        pathname: '/doctor/cases/new',
                                        query: {
                                            appointmentId: latestOpenAppointment.id,
                                            patientId: patientProfile.id,
                                            patientName: patientProfile.name,
                                            patientAge: patientProfile.age || '',
                                            patientGender: patientProfile.gender || ''
                                        }
                                    });
                                }}
                            >
                                <Stethoscope size={16} />
                                Start Consultation
                            </Button>
                        )}
                    </div>
                }
            />

            {error && (
                <Card padding="md" className="mb-6 border-l-4 border-l-rose-600 bg-rose-50">
                    <p className="text-sm text-rose-700">{error}</p>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Appointments"
                    value={appointments.length}
                    icon={ClipboardList}
                    color="text-blue-700"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    label="Consultation Cases"
                    value={cases.length}
                    icon={FileText}
                    color="text-emerald-700"
                    bgColor="bg-emerald-50"
                />
                <StatCard
                    label="Prescriptions"
                    value={prescriptions.length}
                    icon={Pill}
                    color="text-amber-700"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    label="Telemedicine Sessions"
                    value={sessions.length}
                    icon={Video}
                    color="text-purple-700"
                    bgColor="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 space-y-6">
                    <Card title="Appointment Timeline" subtitle="Recent and upcoming bookings" padding="md">
                        {appointments.length === 0 ? (
                            <EmptyState
                                title="No appointments yet"
                                description="Appointments will appear here once this patient books with you."
                            />
                        ) : (
                            <div className="space-y-3">
                                {appointments.slice(0, 8).map((appointment) => (
                                    <div key={appointment.id} className="p-3 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-900">Appointment #{appointment.id}</p>
                                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                                <Calendar size={14} />
                                                {formatDate(appointment.appointmentDate)}
                                                <Clock size={14} className="ml-1" />
                                                {formatTime(appointment.appointmentTime)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusVariant(appointment.status)} size="sm">
                                                {appointment.status}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/doctor/appointments/${appointment.id}`)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Consultation Cases" subtitle="Clinical documentation history" padding="md">
                        {cases.length === 0 ? (
                            <EmptyState
                                title="No consultation cases"
                                description="Cases created during consultations will be available here."
                            />
                        ) : (
                            <div className="space-y-3">
                                {cases.slice(0, 8).map((item) => (
                                    <div key={item.id} className="p-3 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-900">Case #{item.id}</p>
                                            <p className="text-sm text-slate-600">{item.chiefComplaint || 'No chief complaint captured'}</p>
                                            <p className="text-xs text-slate-500">Updated {formatDate(item.updatedAt || item.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusVariant(item.status)} size="sm">
                                                {item.status || 'DRAFT'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/doctor/cases/${item.id}`)}
                                            >
                                                Open
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="xl:col-span-5 space-y-6">
                    <Card title="Prescription Archive" subtitle="Issued medication plans" padding="md">
                        {prescriptions.length === 0 ? (
                            <EmptyState
                                title="No prescriptions"
                                description="Generated prescriptions will be listed here."
                            />
                        ) : (
                            <div className="space-y-3">
                                {prescriptions.slice(0, 8).map((prescription) => (
                                    <div key={prescription.id} className="p-3 border border-slate-200 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-slate-900">{prescription.medicineName}</p>
                                            <Badge variant="info" size="sm">#{prescription.id}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {prescription.dosage} • {prescription.duration}
                                        </p>
                                        {prescription.instructions && (
                                            <p className="text-xs text-slate-500">{prescription.instructions}</p>
                                        )}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleDownloadPrescription(prescription.id)}
                                        >
                                            <Download size={14} />
                                            PDF
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Telemedicine Sessions" subtitle="Virtual care interactions" padding="md">
                        {sessions.length === 0 ? (
                            <EmptyState
                                title="No virtual sessions"
                                description="Telemedicine records will appear after session scheduling."
                            />
                        ) : (
                            <div className="space-y-3">
                                {sessions.slice(0, 8).map((session) => (
                                    <div key={session.sessionId || session.id} className="p-3 border border-slate-200 rounded-xl">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-slate-900">Session {session.sessionId || session.id}</p>
                                            <Badge variant={statusVariant(session.status)} size="sm">
                                                {session.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {session.scheduledStartTime ? formatDate(session.scheduledStartTime) : 'Date unavailable'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {session.consultationNotes || 'No consultation notes captured'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorPatientDetailPage;
