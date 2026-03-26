import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Activity,
    Users,
    Calendar,
    TrendingUp
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import VerificationStatusBanner from '../../components/doctor/VerificationStatusBanner';
import AppointmentCard from '../../components/doctor/AppointmentCard';
import useDoctorProfile from '../../hooks/useDoctorProfile';
import useToast from '../../hooks/useToast';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { isToday } from '../../lib/utils';

const DoctorDashboard = () => {
    const router = useRouter();
    const { profile, fetchProfile, loading: profileLoading } = useDoctorProfile();
    // Use dummy appointments data instead of fetching
    const [appointments] = useState([
        {
            id: 1,
            patientId: 101,
            patientName: 'John Doe',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'CONFIRMED',
            time: '10:00 AM'
        },
        {
            id: 2,
            patientId: 102,
            patientName: 'Jane Smith',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'CONFIRMED',
            time: '11:30 AM'
        }
    ]);
    const appointmentsLoading = false;
    useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Fetch doctor profile
            fetchProfile().catch((err) => {
                if (err.response?.status === 404) {
                    // Profile doesn't exist, redirect to setup
                    router.push('/doctor/profile/setup');
                }
            });
        }
    }, [fetchProfile, router]);

    const todaysAppointments = appointments.filter(appt =>
        isToday(appt.appointmentDate) && appt.status !== 'CANCELLED'
    );

    const upcomingAppointments = appointments
        .filter(appt =>
            !isToday(appt.appointmentDate) &&
            new Date(appt.appointmentDate) > new Date() &&
            (appt.status === 'CONFIRMED' || appt.status === 'PAID')
        )
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);

    const stats = [
        {
            label: 'Today\'s Appointments',
            value: todaysAppointments.length,
            icon: Activity,
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
            trend: { value: '+3', isPositive: true }
        },
        {
            label: 'Total Patients',
            value: new Set(appointments.map(a => a.patientId)).size || 0,
            icon: Users,
            color: 'text-teal-700',
            bgColor: 'bg-teal-50'
        },
        {
            label: 'Consultation Fee',
            value: profile?.consultationFee ? `Rs. ${profile.consultationFee}` : 'Not Set',
            icon: TrendingUp,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50'
        }
    ];

    const handleViewDetails = (appointment) => {
        router.push(`/doctor/appointments/${appointment.id}`);
    };

    if (profileLoading || appointmentsLoading) {
        return <LoadingSpinner size="fullscreen" message="Loading Dashboard..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title={`Dr. ${profile?.userId || 'Doctor'}`}
                subtitle={profile?.specialization || 'Medical Professional'}
                verificationStatus={profile ? {
                    status: profile.verificationStatus,
                    message: profile.verificationStatus
                } : null}
            />

            {/* Verification Status Banner */}
            {profile && profile.verificationStatus !== 'APPROVED' && (
                <VerificationStatusBanner status={profile.verificationStatus} />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        bgColor={stat.bgColor}
                        trend={stat.trend}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Today's Appointments */}
                    <Card
                        title="Today's Appointments"
                        subtitle={`${todaysAppointments.length} appointments scheduled`}
                        actions={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(DOCTOR_ROUTES.APPOINTMENTS)}
                            >
                                View All
                            </Button>
                        }
                        padding="none"
                    >
                        <div className="space-y-3 p-5 max-h-52 overflow-y-auto">
                            {todaysAppointments.length > 0 ? (
                                todaysAppointments.map((appt) => (
                                    <AppointmentCard
                                        key={appt.id}
                                        appointment={appt}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Calendar className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
                                    <p className="text-sm text-[var(--color-text-muted)]">No appointments today</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Upcoming Appointments - Compact */}
                    {upcomingAppointments.length > 0 && (
                        <Card
                            title="Upcoming"
                            subtitle="Next 7 days"
                            padding="none"
                        >
                            <div className="space-y-2 p-5 max-h-44 overflow-y-auto">
                                {upcomingAppointments.slice(0, 3).map((appt) => (
                                    <AppointmentCard
                                        key={appt.id}
                                        appointment={appt}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Quick Actions */}
                    <Card
                        title="Quick Actions"
                        padding="md"
                        variant="default"
                    >
                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                size="md"
                                className="w-full text-xs"
                                onClick={() => router.push(DOCTOR_ROUTES.PRESCRIPTIONS)}
                            >
                                New Prescription
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                className="w-full text-xs"
                                onClick={() => router.push(DOCTOR_ROUTES.SCHEDULE)}
                            >
                                Manage Schedule
                            </Button>
                            <Button
                                variant="outline"
                                size="md"
                                className="w-full text-xs"
                                onClick={() => router.push(DOCTOR_ROUTES.PATIENTS)}
                            >
                                View Patients
                            </Button>
                        </div>
                    </Card>

                    {/* Profile Completion */}
                    {profile && !profile.bio && (
                        <Card
                            title="Profile"
                            padding="sm"
                            variant="glass"
                        >
                            <p className="text-xs text-slate-600 mb-3">
                                Add details to attract patients.
                            </p>
                            <Button
                                variant="primary"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => router.push(DOCTOR_ROUTES.PROFILE)}
                            >
                                Update
                            </Button>
                        </Card>
                    )}

                    {/* Quick Stats */}
                    <Card
                        title="This Month"
                        padding="md"
                    >
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                                    Appointments
                                </span>
                                <span className="text-xl font-bold text-[var(--color-text)]">
                                    {appointments.filter(a =>
                                        new Date(a.appointmentDate).getMonth() === new Date().getMonth() &&
                                        a.status === 'COMPLETED'
                                    ).length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                                    Earnings
                                </span>
                                <span className="text-lg font-bold text-emerald-600">
                                    Rs. {(appointments.filter(a =>
                                        new Date(a.appointmentDate).getMonth() === new Date().getMonth() &&
                                        a.status === 'COMPLETED'
                                    ).length * (profile?.consultationFee || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorDashboard;
