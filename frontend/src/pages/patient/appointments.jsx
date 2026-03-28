import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientAppointmentsRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/appointments');
    }, [router]);

    return <LoadingSpinner size="fullscreen" message="Opening appointment timeline..." />;
};

export default PatientAppointmentsRedirect;
