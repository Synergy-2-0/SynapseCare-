import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { patientApi } from '../../lib/api';
import { supabaseStorage } from '../../lib/supabase';
import Image from 'next/image';
import { Camera, ShieldCheck, Phone, EnvelopeSimple } from '@phosphor-icons/react';

const PatientProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [clinicalId, setClinicalId] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    setError('Unable to load profile: user not found.');
                    return;
                }

                // Call /user/{userId} to resolve the profile
                const response = await patientApi.get(`/user/${userId}`);
                const payload = response?.data?.data ?? response?.data ?? {};

                setClinicalId(payload.id);
                setProfileImageUrl(payload.profileImageUrl);
                setForm({
                    firstName: payload.name?.split(' ')[0] || '',
                    lastName: payload.name?.split(' ').slice(1).join(' ') || '',
                    email: payload.email || localStorage.getItem('user_email') || '',
                    phoneNumber: payload.phone || '',
                    gender: payload.gender || '',
                    address: payload.address || ''
                });
            } catch (err) {
                console.warn('Patient profile record missing for user - initializing empty form.', err);
                setForm({
                    firstName: localStorage.getItem('user_name')?.split(' ')[0] || '',
                    lastName: localStorage.getItem('user_name')?.split(' ').slice(1).join(' ') || '',
                    email: localStorage.getItem('user_email') || '',
                    phoneNumber: localStorage.getItem('user_phone') || '',
                    gender: '',
                    address: ''
                });
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
            const payload = {
                userId: parseInt(userId, 10),
                name: `${form.firstName} ${form.lastName}`.trim(),
                email: form.email,
                phone: form.phoneNumber,
                gender: form.gender,
                address: form.address,
                profileImageUrl: profileImageUrl
            };

            if (clinicalId) {
                await patientApi.put(`/${clinicalId}`, payload);
            } else {
                const res = await patientApi.post('/', payload);
                setClinicalId(res.data?.id || res.data?.data?.id);
            }

            setSuccess('Profile updated successfully.');
            localStorage.setItem('user_name', payload.name);
            localStorage.setItem('user_phone', payload.phone);
            if (payload.profileImageUrl) {
                localStorage.setItem('user_image', payload.profileImageUrl);
            }
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Identity Shard */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="p-8 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none" />
                                
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-800 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <Image 
                                            src={profileImageUrl || `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=0d9488&color=fff&bold=true`}
                                            alt="Profile"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                            unoptimized={!!profileImageUrl}
                                        />
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-white cursor-pointer hover:bg-teal-600 transition-all shadow-lg hover:rotate-12">
                                        <Camera size={20} weight="bold" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    try {
                                                        const userId = localStorage.getItem('user_id');
                                                        const path = `patient-profiles/${userId}_${Date.now()}_${file.name}`;
                                                        const { error: uploadError } = await supabaseStorage.upload(file, path);
                                                        if (uploadError) throw uploadError;
                                                        setProfileImageUrl(supabaseStorage.getPublicUrl(path));
                                                    } catch (err) {
                                                        setError('Failed to sync artifact with clinical-media registry.');
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                <h3 className="text-xl font-black text-white tracking-tight">{form.firstName} {form.lastName}</h3>
                                <p className="text-[10px] font-mono text-teal-400 mt-1 uppercase tracking-widest">Case ID: 0x{clinicalId?.toString().padStart(6, '0') || 'PENDING'}</p>
                                
                                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-teal-400">
                                            <ShieldCheck size={16} weight="bold" />
                                        </div>
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Verified Identity</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Edit Shard */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card padding="lg" className="rounded-[3rem] border-slate-100 shadow-xl shadow-slate-200/50">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Identity Component</label>
                                            <input
                                                type="text"
                                                value={form.firstName}
                                                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all font-bold text-slate-700"
                                                placeholder="First Name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Identity Component</label>
                                            <input
                                                type="text"
                                                value={form.lastName}
                                                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all font-bold text-slate-700"
                                                placeholder="Last Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <EnvelopeSimple size={12} weight="bold" /> Communications Ingress
                                            </label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                disabled
                                                className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed opacity-60"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Phone size={12} weight="bold" /> Mobile Telemetry
                                            </label>
                                            <input
                                                type="text"
                                                value={form.phoneNumber}
                                                onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all font-bold text-slate-700"
                                                placeholder="Phone Number"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Identification</label>
                                            <select
                                                value={form.gender}
                                                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                                            >
                                                <option value="">Select Identity</option>
                                                <option value="MALE">MALE</option>
                                                <option value="FEMALE">FEMALE</option>
                                                <option value="OTHER">OTHER</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Residence</label>
                                            <input
                                                type="text"
                                                value={form.address}
                                                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-teal-400 focus:bg-white transition-all font-bold text-slate-700"
                                                placeholder="Address"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                            Diagnostic Error: {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                            Registry Sync Status: {success}
                                        </div>
                                    )}

                                    <Button type="submit" variant="primary" loading={saving} className="w-full h-16 rounded-[1.5rem] shadow-xl shadow-teal-500/20 uppercase tracking-[0.2em] font-black text-xs">
                                        Synchronize Clinical Identity
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>
            </Card>
        </DashboardLayout>
    );
};

export default PatientProfilePage;
