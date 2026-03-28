import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientFindDoctorsRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/doctors');
    }, [router]);

    return <LoadingSpinner size="fullscreen" message="Opening doctor directory..." />;
};

export default PatientFindDoctorsRedirect;
