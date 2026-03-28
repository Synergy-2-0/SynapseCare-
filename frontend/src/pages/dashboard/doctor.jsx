import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LegacyDoctorDashboardRoute = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/doctor/dashboard');
    }, [router]);

    return <LoadingSpinner size="fullscreen" message="Redirecting to doctor workspace..." />;
};

export default LegacyDoctorDashboardRoute;
