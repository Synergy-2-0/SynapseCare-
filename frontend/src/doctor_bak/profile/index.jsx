import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CalendarCheck2, CircleDollarSign, ShieldCheck, Stethoscope } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { doctorApi } from '../../../lib/api';

const DoctorProfileEntryPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await doctorApi.get('/profile/me');
                const payload = response?.data?.data ?? response?.data;

                if (!payload) {
                    router.replace('/doctor/profile/setup');
                    return;
                }

                setProfile(payload);
            } catch (err) {
                if (err.response?.status === 404) {
                    router.replace('/doctor/profile/setup');
                    return;
                }

                console.error('Failed to fetch doctor profile:', err);
                setError('Unable to load doctor profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleAvailabilityToggle = async () => {
        if (!profile) {
            return;
        }

        try {
            setSaving(true);
            const nextStatus = !profile.isAvailable;
            await doctorApi.put('/status', { isAvailable: nextStatus });
            setProfile((prev) => ({ ...prev, isAvailable: nextStatus }));
        } catch (err) {
            console.error('Failed to update availability status:', err);
            setError('Unable to update availability status.');
        } finally {
            setSaving(false);
        }
    };

    const verificationVariant =
        profile?.verificationStatus === 'APPROVED'
            ? 'success'
            : profile?.verificationStatus === 'REJECTED'
                ? 'danger'
                : 'warning';

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading doctor profile..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title="Doctor Profile"
                subtitle="Manage your professional identity and public availability"
                actions={
                    <Button variant="primary" onClick={() => router.push('/doctor/profile/setup')}>
                        Edit Profile
                    </Button>
                }
            />

            {error && (
                <Card padding="md" className="mb-6 border-l-4 border-l-rose-600 bg-rose-50">
                    <p className="text-sm text-rose-700">{error}</p>
                </Card>
            )}

            {profile && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card padding="md" className="xl:col-span-2">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">Professional Summary</h3>
                                <Badge variant={verificationVariant} size="sm">{profile.verificationStatus || 'PENDING'}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                                <div className="flex items-start gap-2">
                                    <Stethoscope size={16} className="mt-0.5 text-blue-600" />
                                    <div>
                                        <p className="text-slate-500">Specialization</p>
                                        <p className="font-medium text-slate-900">{profile.specialization || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <CircleDollarSign size={16} className="mt-0.5 text-emerald-600" />
                                    <div>
                                        <p className="text-slate-500">Consultation Fee</p>
                                        <p className="font-medium text-slate-900">LKR {profile.consultationFee || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <ShieldCheck size={16} className="mt-0.5 text-indigo-600" />
                                    <div>
                                        <p className="text-slate-500">License Number</p>
                                        <p className="font-medium text-slate-900">{profile.licenseNumber || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <CalendarCheck2 size={16} className="mt-0.5 text-amber-600" />
                                    <div>
                                        <p className="text-slate-500">Experience</p>
                                        <p className="font-medium text-slate-900">{profile.experience || 0} years</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-500 text-sm mb-1">Qualifications</p>
                                <p className="text-slate-800 text-sm">{profile.qualifications || 'Not specified'}</p>
                            </div>

                            <div>
                                <p className="text-slate-500 text-sm mb-1">Bio</p>
                                <p className="text-slate-800 text-sm">{profile.bio || 'No bio added yet.'}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Availability Status</h3>
                        <div className="space-y-4">
                            <Badge variant={profile.isAvailable ? 'success' : 'neutral'} size="md">
                                {profile.isAvailable ? 'Accepting Appointments' : 'Not Available'}
                            </Badge>

                            <p className="text-sm text-slate-600">
                                Toggle this status to quickly control whether patients can see and book you.
                            </p>

                            <Button
                                variant={profile.isAvailable ? 'secondary' : 'primary'}
                                onClick={handleAvailabilityToggle}
                                loading={saving}
                                className="w-full"
                            >
                                {profile.isAvailable ? 'Set As Unavailable' : 'Set As Available'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => router.push('/doctor/schedule')}
                                className="w-full"
                            >
                                Manage Weekly Schedule
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DoctorProfileEntryPage;
