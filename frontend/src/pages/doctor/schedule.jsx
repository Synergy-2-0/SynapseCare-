import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import ScheduleTab from '@/components/doctor/ScheduleTab';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';

const SchedulePage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');
            const name = localStorage.getItem('user_name');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            setUserData({ name, id });

            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }

                    const apptRes = await appointmentApi.get(`/doctor/${id}`);
                    setAppointments((apptRes.data?.data || apptRes.data || []).filter(a => a.status !== 'CANCELLED'));
                } catch (err) {
                    console.error("Failed to fetch schedule data", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    if (loading) return null;

    return (
        <DashboardLayout>
            <Head>
                <title>Schedule | SynapsCare Doctor</title>
            </Head>
            <div className="relative">
                <ScheduleTab 
                    appointments={appointments} 
                    doctorId={userData?.id}
                    onAppointmentClick={(appt) => {
                        setSelectedAppointment(appt);
                        setIsDrawerOpen(true);
                    }}
                />
                <PatientContextDrawer 
                    isOpen={isDrawerOpen} 
                    onClose={() => setIsDrawerOpen(false)} 
                    appointment={selectedAppointment} 
                />
            </div>
        </DashboardLayout>
    );
};

export default SchedulePage;
