import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, ClipboardCheck, XCircle, Stethoscope } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { appointmentApi } from '../../../lib/api';
import { formatDate, formatTime } from '../../../lib/utils';

const DoctorAppointmentDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    const normalized = useMemo(() => {
        if (!appointment) {
            return null;
        }

        return {
            ...appointment,
            appointmentDate: appointment.appointmentDate || appointment.date,
            appointmentTime: appointment.appointmentTime || appointment.time
        };
    }, [appointment]);

    useEffect(() => {
        const fetchAppointment = async () => {
            if (!id) {
                return;
            }

            try {
                setLoading(true);
                setError('');
                const response = await appointmentApi.get(`/${id}`);
                const payload = response?.data?.data ?? response?.data;
                setAppointment(payload || null);
            } catch (err) {
                console.error('Failed to fetch appointment details:', err);
                setError('Unable to load appointment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id]);

    const updateStatus = async (action) => {
        if (!normalized?.id) {
            return;
        }

        try {
            setUpdating(true);
            await appointmentApi.put(`/${normalized.id}/${action}`);
            const nextStatus = action === 'accept' ? 'CONFIRMED' : 'REJECTED';
            setAppointment((prev) => ({ ...prev, status: nextStatus }));
        } catch (err) {
            console.error(`Failed to ${action} appointment:`, err);
            setError(`Failed to ${action} appointment.`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading appointment details..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title={`Appointment #${normalized?.id || ''}`}
                subtitle="Review patient appointment details and take action"
                actions={
                    <Button variant="secondary" onClick={() => router.push('/doctor/appointments')}>
                        Back to Queue
                    </Button>
                }
            />

            {!normalized || error ? (
                <Card padding="md" className="border-l-4 border-l-rose-600 bg-rose-50">
                    <p className="text-rose-700 text-sm">{error || 'Appointment not found.'}</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card padding="md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-slate-900">Patient Information</h3>
                                <p>Patient ID: {normalized.patientId}</p>
                                <p>Status: <Badge variant={normalized.status === 'CONFIRMED' ? 'info' : normalized.status === 'REJECTED' ? 'danger' : 'warning'} size="sm">{normalized.status}</Badge></p>
                                <p>Consultation Type: {normalized.consultationType || 'VIDEO'}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-slate-900">Schedule</h3>
                                <p className="flex items-center gap-2"><Calendar size={16} /> {formatDate(normalized.appointmentDate)}</p>
                                <p className="flex items-center gap-2"><Clock size={16} /> {formatTime(normalized.appointmentTime)}</p>
                                <p>Token Number: #{normalized.tokenNumber || '-'}</p>
                            </div>
                        </div>
                    </Card>

                    {normalized.reason && (
                        <Card padding="md">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reason for Visit</h3>
                            <p className="text-slate-700 text-sm">{normalized.reason}</p>
                        </Card>
                    )}

                    <Card padding="md">
                        <div className="flex flex-wrap gap-3">
                            {normalized.status === 'PENDING' && (
                                <>
                                    <Button variant="primary" loading={updating} onClick={() => updateStatus('accept')}>
                                        <ClipboardCheck size={16} />
                                        Accept Appointment
                                    </Button>
                                    <Button variant="danger" loading={updating} onClick={() => updateStatus('reject')}>
                                        <XCircle size={16} />
                                        Reject Appointment
                                    </Button>
                                </>
                            )}

                            {['CONFIRMED', 'PAID'].includes(normalized.status) && (
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        router.push({
                                            pathname: '/doctor/cases/new',
                                            query: {
                                                appointmentId: normalized.id,
                                                patientId: normalized.patientId,
                                                patientName: normalized.patientName || `Patient ${normalized.patientId}`
                                            }
                                        });
                                    }}
                                >
                                    <Stethoscope size={16} />
                                    Start Consultation
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DoctorAppointmentDetailPage;
