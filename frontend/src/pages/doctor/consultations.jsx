import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import TelemedicineTab from '@/components/doctor/TelemedicineTab';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import { AnimatePresence } from 'framer-motion';

const ConsultationsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activePostSession, setActivePostSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');
            const name = localStorage.getItem('user_name');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            setUserData({ name, id, doctorDbId: null });

            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }

                    const doctorDbId = profileRes?.data?.id || id;
                    setUserData({ name, id, doctorDbId });
                    
                    // Fetch appointments
                    const apptRes = await appointmentApi.get(`/doctor/${doctorDbId}`);
                    const appts = (apptRes.data?.data || apptRes.data || []).filter(a => a.status !== 'CANCELLED');
                    setAppointments(appts);

                    // Fetch patient details to resolve names
                    if (appts.length > 0) {
                        try {
                            const patRes = await appointmentApi.get(`/doctor/${doctorDbId}/patients`);
                            const patList = patRes.data?.data || patRes.data || [];
                            const map = {};
                            patList.forEach(p => { if (p?.id) map[p.id] = p; });
                            setUserData(prev => ({ ...prev, patientsMap: map }));
                        } catch (patErr) {
                            console.warn('Could not load patient names:', patErr.message);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch tele-consultations", err);
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
                <title>Consultations | SynapsCare Doctor</title>
            </Head>
            <div className="relative">
                <TelemedicineTab 
                    appointments={appointments} 
                    userData={userData} 
                    onCompleteSession={(id) => {
                        setAppointments(prev => prev.filter(a => a.id !== id));
                    }} 
                    onEndSession={(appt, notes) => {
                        toast.success("Consultation notes synchronized. You can issue the digital prescription from the Prescriptions ledger at any time.");
                    }} 
                />
                <AnimatePresence>
                    {activePostSession && (
                        <SessionPrescriptionModal 
                            session={activePostSession} 
                            onClose={() => setActivePostSession(null)} 
                            doctorId={userData?.doctorDbId || userData?.id} 
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default ConsultationsPage;
