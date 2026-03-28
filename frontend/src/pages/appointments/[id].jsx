import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, Video, CreditCard } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { appointmentApi } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/utils';

const AppointmentDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
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
                const response = await appointmentApi.get(`/${id}`);
                const payload = response?.data?.data ?? response?.data;
                setAppointment(payload || null);
            } catch (err) {
                console.error('Failed to fetch appointment detail:', err);
                setError('Unable to load appointment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id]);

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading appointment details..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title={`Appointment #${normalized?.id || ''}`}
                subtitle="Appointment details and next actions"
                actions={
                    <Button variant="secondary" onClick={() => router.push('/appointments')}>
                        Back to Appointments
                    </Button>
                }
            />

            {!normalized || error ? (
                <Card padding="md" className="border-l-4 border-l-rose-600 bg-rose-50">
                    <p className="text-sm text-rose-700">{error || 'Appointment not found.'}</p>
                </Card>
            ) : (
                <div className="space-y-5">
                    <Card padding="md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-slate-900">Schedule</h3>
                                <p className="flex items-center gap-2"><Calendar size={16} /> {formatDate(normalized.appointmentDate)}</p>
                                <p className="flex items-center gap-2"><Clock size={16} /> {formatTime(normalized.appointmentTime)}</p>
                                <p>Token Number: #{normalized.tokenNumber || '-'}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-slate-900">Clinical Status</h3>
                                <p>
                                    Status: <Badge variant={normalized.status === 'CONFIRMED' ? 'info' : normalized.status === 'COMPLETED' ? 'success' : normalized.status === 'CANCELLED' ? 'danger' : 'warning'} size="sm">{normalized.status}</Badge>
                                </p>
                                <p>Consultation Type: {normalized.consultationType || 'VIDEO'}</p>
                                <p>Fee: LKR {normalized.fee || 0}</p>
                            </div>
                        </div>
                    </Card>

                    {normalized.reason && (
                        <Card padding="md">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reason</h3>
                            <p className="text-sm text-slate-700">{normalized.reason}</p>
                        </Card>
                    )}

                    <Card padding="md">
                        <div className="flex flex-wrap gap-3">
                            {normalized.status === 'PENDING' && (
                                <Button
                                    variant="primary"
                                    onClick={() => router.push(`/payment?id=${normalized.id}&amount=${normalized.fee || 1500}&patientId=${normalized.patientId}`)}
                                >
                                    <CreditCard size={16} />
                                    Complete Payment
                                </Button>
                            )}

                            {normalized.status === 'CONFIRMED' && (
                                <Button variant="success" onClick={() => router.push(`/telemedicine?appointmentId=${normalized.id}`)}>
                                    <Video size={16} />
                                    Join Telemedicine
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AppointmentDetailPage;
