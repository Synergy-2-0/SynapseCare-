import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientBookAppointmentPage = () => {
    const router = useRouter();
    const { doctorId } = router.query;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        if (doctorId) {
            router.replace(`/doctors/${doctorId}`);
            return;
        }

        router.replace('/doctors');
    }, [router, doctorId]);

    return <LoadingSpinner size="fullscreen" message="Preparing booking flow..." />;
};

export default PatientBookAppointmentPage;
