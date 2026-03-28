import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { patientApi } from '../../lib/api';

const PatientProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    setError('Unable to load profile: user not found.');
                    return;
                }

                const response = await patientApi.get(`/${userId}`);
                const payload = response?.data?.data ?? response?.data ?? {};

                setForm({
                    firstName: payload.firstName || '',
                    lastName: payload.lastName || '',
                    email: payload.email || localStorage.getItem('user_email') || '',
                    phoneNumber: payload.phoneNumber || ''
                });
            } catch (err) {
                console.error('Failed to fetch patient profile:', err);
                setError('Unable to load profile details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setError('Unable to save profile: user not found.');
                return;
            }

            setSaving(true);
            await patientApi.put(`/${userId}`, form);
            setSuccess('Profile updated successfully.');
        } catch (err) {
            console.error('Failed to update patient profile:', err);
            setError(err?.response?.data?.message || 'Unable to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading your profile..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title="My Profile"
                subtitle="Manage your contact details and account information"
            />

            <Card padding="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={form.phoneNumber}
                                onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-rose-600">{error}</p>}
                    {success && <p className="text-sm text-emerald-600">{success}</p>}

                    <Button type="submit" variant="primary" loading={saving}>
                        Save Profile
                    </Button>
                </form>
            </Card>
        </DashboardLayout>
    );
};

export default PatientProfilePage;
