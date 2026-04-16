import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import ScheduleTab from '@/components/doctor/ScheduleTab';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';
import { useCallback } from 'react';

const SchedulePage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        if (typeof window === 'undefined') return;

        const role = localStorage.getItem('user_role');
        const userId = localStorage.getItem('user_id');
        const name = localStorage.getItem('user_name');

        if (role !== 'DOCTOR') { router.push('/login'); return; }
        setUserData({ name, userId, doctorId: null });

        try {
            const profileRes = await doctorApi.get('/profile/me');
            const doctorProfile = profileRes?.data;

            if (!isDoctorApproved(doctorProfile?.verificationStatus)) {
                router.replace('/doctor/setup');
                return;
            }

            const doctorId = doctorProfile?.id;
            if (!doctorId) {
                throw new Error('Doctor profile ID is missing');
            }

            if (doctorProfile?.profileImageUrl) {
                localStorage.setItem('user_profile_img', doctorProfile.profileImageUrl);
            }

            setUserData({ name, userId, doctorId });

            const apptRes = await appointmentApi.get(`/doctor/${doctorId}`);
            setAppointments(Array.isArray(apptRes.data?.data || apptRes.data || []) ? (apptRes.data?.data || apptRes.data || []) : []);
        } catch (err) {
            console.error("Failed to fetch schedule data", err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return null;

    return (
        <DashboardLayout>
            <Head>
                <title>Schedule | SynapsCare Doctor</title>
            </Head>
            <div className="relative">
                <ScheduleTab 
                    appointments={appointments} 
                    doctorId={userData?.doctorId}
                    onRefresh={fetchData}
                    onAppointmentClick={(appt) => {
                        setSelectedAppointment(appt);
                        setIsDrawerOpen(true);
                    }}
                />
                <PatientContextDrawer 
                    isOpen={isDrawerOpen} 
                    onClose={() => setIsDrawerOpen(false)} 
                    appointment={selectedAppointment} 
                    doctorId={userData?.doctorId}
                />
            </div>
        </DashboardLayout>
    );
};

export default SchedulePage;
