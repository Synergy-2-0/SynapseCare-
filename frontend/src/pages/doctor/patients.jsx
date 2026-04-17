import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import PatientRosterTab from '@/components/doctor/PatientRosterTab';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';

const PatientsPage = () => {
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
            setUserData({ name, authId: id });

            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }
                    
                    const dbId = profileRes.data?.id || id;
                    setUserData({ name, id: dbId, authId: id });
                } catch (err) {
                    console.error("Failed to check profile", err);
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
                <title>My Patients | SynapsCare Doctor</title>
            </Head>
            <div className="relative">
                <PatientRosterTab 
                    userData={userData}
                    onViewPatient={(patient) => {
                        setSelectedAppointment({
                            ...patient,
                            patientId: patient?.patientId || patient?.id,
                            patientName: patient?.patientName || patient?.name,
                        });
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

export default PatientsPage;
