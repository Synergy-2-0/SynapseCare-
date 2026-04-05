import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientTelemedicineCenterRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/patient?tab=telemedicine');
    }, [router]);

    return <LoadingSpinner size="fullscreen" message="Opening Virtual Clinic..." />;
};

export default PatientTelemedicineCenterRedirect;
