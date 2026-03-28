import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientMedicalRecordsRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/patient');
    }, [router]);

    return <LoadingSpinner size="fullscreen" message="Opening medical records..." />;
};

export default PatientMedicalRecordsRedirect;
