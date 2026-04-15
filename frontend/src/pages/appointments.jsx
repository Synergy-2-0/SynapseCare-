import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { appointmentApi, patientApi } from '../lib/api';
import {
    Calendar,
    Clock,
    Video,
    Search,
    Plus,
    Filter,
    User,
    ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../lib/utils';

const AppointmentsPage = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [userRole, setUserRole] = useState('PATIENT');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('user_id');
            const role = localStorage.getItem('user_role');
            setUserRole(role || 'PATIENT');

            const fetchData = async () => {
                try {
                    let endpoint = null;

                    if (role === 'DOCTOR') {
                        endpoint = `/doctor/${userId}`;
                    } else {
                        const cachedClinicalId = localStorage.getItem('patient_id');
                        if (cachedClinicalId) {
                            endpoint = `/patient/${cachedClinicalId}`;
                        }

                        try {
                            if (!endpoint) {
                                const patientRes = await patientApi.get(`/user/${userId}`);
                                const payload = patientRes?.data?.data ?? patientRes?.data ?? {};
                                const clinicalId = payload?.id;

                                if (clinicalId) {
                                    localStorage.setItem('patient_id', String(clinicalId));
                                    endpoint = `/patient/${clinicalId}`;
                                }
                            }
                        } catch (resolveErr) {
                            endpoint = endpoint || null;
                        }

                        if (!endpoint) {
                            setAppointments([]);
                            setLoading(false);
                            return;
                        }
                    }

                    const res = await appointmentApi.get(endpoint);
                    const payload = res?.data?.data ?? res?.data ?? [];
                    const normalized = Array.isArray(payload)
                        ? payload.map((appointment) => ({
                            ...appointment,
                            appointmentDate: appointment.appointmentDate || appointment.date,
                            appointmentTime: appointment.appointmentTime || appointment.time
                        }))
                        : [];

                    setAppointments(normalized);
                } catch (err) {
                    console.error('Failed to load appointments', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, []);

    const filteredAppointments = appointments.filter(appt => {
        const appointmentDate = appt.appointmentDate || appt.date;

        if (filter === 'upcoming') {
            return new Date(appointmentDate) >= new Date();
        }
        if (filter === 'past') {
            return new Date(appointmentDate) < new Date();
        }

        return true;
    }).filter((appt) => {
        if (!searchQuery.trim()) {
            return true;
        }

        const query = searchQuery.trim().toLowerCase();
        const doctorDisplay = (appt.doctorName || `doctor #${appt.doctorId || ''}`).toLowerCase();
        const patientDisplay = (appt.patientName || `patient #${appt.patientId || ''}`).toLowerCase();
        const statusDisplay = (appt.status || '').toLowerCase();

        return doctorDisplay.includes(query)
            || patientDisplay.includes(query)
            || statusDisplay.includes(query)
            || String(appt.id || '').includes(query);
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PAID':
            case 'COMPLETED':
                return 'success';
            case 'CONFIRMED':
                return 'info';
            case 'PENDING':
                return 'warning';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'neutral';
        }
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading appointments..." />;
    }

    return (
        <DashboardLayout title="Appointments Registry | Clinical Sessions">
            <Header
                title="Appointments"
                subtitle={userRole === 'DOCTOR' ? 'View and manage your patient appointments' : 'View and manage your appointments'}
            />

            {/* Search and Filters */}
            <Card padding="md" className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 w-64"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                            <option value="all">All Appointments</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                        </select>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                            if (userRole === 'DOCTOR') {
                                router.push('/doctor/dashboard');
                                return;
                            }

                            router.push('/patient/find-doctors');
                        }}
                    >
                        <Plus size={16} />
                        {userRole === 'DOCTOR' ? 'Go to Dashboard' : 'Book Appointment'}
                    </Button>
                </div>
            </Card>

            {/* Appointments List */}
            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No appointments found"
                        description="You don't have any appointments yet. Book your first appointment to get started."
                        action={
                            <Button
                                variant="primary"
                                onClick={() => {
                                    if (userRole === 'DOCTOR') {
                                        router.push('/doctor/dashboard');
                                        return;
                                    }

                                    router.push('/patient/find-doctors');
                                }}
                            >
                                {userRole === 'DOCTOR' ? 'Go to Dashboard' : 'Find a Doctor'}
                            </Button>
                        }
                    />
                ) : (
                    filteredAppointments.map((appt, index) => (
                        <Card
                            key={appt.id || index}
                            padding="none"
                            hoverable
                            onClick={() => router.push(`/appointments/${appt.id}`)}
                        >
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                    {/* Date Block */}
                                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-blue-600">
                                            {new Date(appt.appointmentDate || appt.date).getDate()}
                                        </span>
                                        <span className="text-xs text-blue-600 uppercase">
                                            {new Date(appt.appointmentDate || appt.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={getStatusVariant(appt.status)} size="sm">
                                                {appt.status}
                                            </Badge>
                                            <span className="text-xs text-slate-400">
                                                ID: #{appt.id}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900">
                                            {userRole === 'DOCTOR'
                                                ? (appt.patientName || `Patient #${appt.patientId}`)
                                                : (appt.doctorName || `Doctor #${appt.doctorId}`)}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {appt.appointmentTime || appt.time || '10:00 AM'}
                                            </span>
                                            {appt.status === 'CONFIRMED' && (
                                                <span className="flex items-center gap-1 text-blue-600">
                                                    <Video size={14} />
                                                    Video Session Available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    {appt.status === 'PENDING' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/payment?appointmentId=${appt.id}&amount=${appt.fee || 1500}&patientId=${appt.patientId}${appt.doctorId ? `&doctorId=${appt.doctorId}` : ''}`);
                                            }}
                                        >
                                            Pay Now
                                        </Button>
                                    )}
                                    {appt.status === 'CONFIRMED' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/telemedicine?appointmentId=${appt.id}`);
                                            }}
                                        >
                                            <Video size={14} />
                                            Join Call
                                        </Button>
                                    )}
                                    <ChevronRight size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
};

export default AppointmentsPage;
