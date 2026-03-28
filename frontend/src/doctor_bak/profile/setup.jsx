import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Stethoscope,
    Award,
    FileText,
    DollarSign,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Upload,
    AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { doctorApi } from '../../../lib/api';
import { DOCTOR_ROUTES } from '../../../constants/routes';

const SPECIALIZATIONS = [
    { value: 'General Physician', label: 'General Physician' },
    { value: 'Cardiologist', label: 'Cardiologist' },
    { value: 'Dermatologist', label: 'Dermatologist' },
    { value: 'Endocrinologist', label: 'Endocrinologist' },
    { value: 'Gastroenterologist', label: 'Gastroenterologist' },
    { value: 'Neurologist', label: 'Neurologist' },
    { value: 'Oncologist', label: 'Oncologist' },
    { value: 'Ophthalmologist', label: 'Ophthalmologist' },
    { value: 'Orthopedic', label: 'Orthopedic Surgeon' },
    { value: 'Pediatrician', label: 'Pediatrician' },
    { value: 'Psychiatrist', label: 'Psychiatrist' },
    { value: 'Pulmonologist', label: 'Pulmonologist' },
    { value: 'Radiologist', label: 'Radiologist' },
    { value: 'Urologist', label: 'Urologist' },
    { value: 'ENT', label: 'ENT Specialist' },
    { value: 'Gynecologist', label: 'Gynecologist' },
];

const DoctorProfileSetup = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        specialization: '',
        licenseNumber: '',
        experience: '',
        qualifications: '',
        consultationFee: '',
        bio: '',
        profileImageUrl: ''
    });

    const totalSteps = 2;

    useEffect(() => {
        const fetchExistingProfile = async () => {
            try {
                setLoading(true);
                const response = await doctorApi.get('/profile/me');
                const profile = response?.data?.data ?? response?.data;

                if (!profile) {
                    setIsEditMode(false);
                    return;
                }

                setFormData({
                    specialization: profile.specialization || '',
                    licenseNumber: profile.licenseNumber || '',
                    experience: profile.experience ? String(profile.experience) : '',
                    qualifications: profile.qualifications || '',
                    consultationFee: profile.consultationFee ? String(profile.consultationFee) : '',
                    bio: profile.bio || '',
                    profileImageUrl: profile.profileImageUrl || ''
                });

                setIsEditMode(true);
            } catch (err) {
                // 404 means profile not created yet.
                if (err.response?.status !== 404) {
                    console.error('Failed to fetch profile:', err);
                    setErrors({
                        submit: 'Unable to load profile details. You can still continue and submit changes.'
                    });
                }
                setIsEditMode(false);
            } finally {
                setLoading(false);
            }
        };

        fetchExistingProfile();
    }, []);

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.specialization) newErrors.specialization = 'Specialization is required';
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        if (formData.experience && (isNaN(formData.experience) || formData.experience < 0)) {
            newErrors.experience = 'Please enter a valid number';
        }
        if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required';
        if (formData.consultationFee && (isNaN(formData.consultationFee) || formData.consultationFee < 0)) {
            newErrors.consultationFee = 'Please enter a valid amount';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.qualifications) newErrors.qualifications = 'Qualifications are required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setSubmitting(true);
        try {
            const payload = {
                specialization: formData.specialization,
                licenseNumber: formData.licenseNumber,
                experience: parseInt(formData.experience),
                qualifications: formData.qualifications,
                consultationFee: parseFloat(formData.consultationFee),
                bio: formData.bio || null,
                profileImageUrl: formData.profileImageUrl || null
            };

            if (isEditMode) {
                await doctorApi.put('/profile', payload);
            } else {
                await doctorApi.post('/profile', payload);
            }

            router.push(DOCTOR_ROUTES.DASHBOARD);
        } catch (err) {
            console.error('Failed to create profile:', err);
            const errorMsg = err.response?.data?.message
                || `Failed to ${isEditMode ? 'update' : 'create'} profile. Please try again.`;
            setErrors({ submit: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const ProgressIndicator = () => (
        <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div
                        className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                            transition-all duration-300
                            ${step >= s
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }
                        `}
                    >
                        {step > s ? <CheckCircle size={16} /> : s}
                    </div>
                    <span className={`text-sm font-medium ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                        {s === 1 ? 'Professional Info' : 'Profile Details'}
                    </span>
                    {s < totalSteps && (
                        <div className={`w-12 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading profile setup..." />;
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <img
                        src="/images/doctor-profile.svg"
                        alt="Doctor Profile"
                        className="w-28 h-28 object-contain mx-auto mb-3"
                    />
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditMode ? 'Update Your Profile' : 'Complete Your Profile'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isEditMode
                            ? 'Maintain your public doctor profile and consultation details'
                            : 'Set up your professional profile to start accepting patients'}
                    </p>
                </div>

                <ProgressIndicator />

                <Card padding="lg">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Select
                                        label="Specialization"
                                        options={SPECIALIZATIONS}
                                        value={formData.specialization}
                                        onChange={handleChange('specialization')}
                                        placeholder="Select your specialization"
                                        error={errors.specialization}
                                        required
                                    />
                                    <Input
                                        label="License Number"
                                        value={formData.licenseNumber}
                                        onChange={handleChange('licenseNumber')}
                                        placeholder="e.g., MED-12345"
                                        error={errors.licenseNumber}
                                        required
                                        icon={FileText}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Years of Experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={handleChange('experience')}
                                        placeholder="e.g., 5"
                                        error={errors.experience}
                                        required
                                        min="0"
                                        max="60"
                                        icon={Award}
                                    />
                                    <Input
                                        label="Consultation Fee (Rs.)"
                                        type="number"
                                        value={formData.consultationFee}
                                        onChange={handleChange('consultationFee')}
                                        placeholder="e.g., 500"
                                        error={errors.consultationFee}
                                        required
                                        min="0"
                                        icon={DollarSign}
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button variant="primary" onClick={handleNext}>
                                        Next Step
                                        <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <Textarea
                                    label="Qualifications"
                                    value={formData.qualifications}
                                    onChange={handleChange('qualifications')}
                                    placeholder="e.g., MBBS from XYZ Medical College, MD in Cardiology from ABC University"
                                    error={errors.qualifications}
                                    required
                                    rows={3}
                                />

                                <Textarea
                                    label="Bio (Optional)"
                                    value={formData.bio}
                                    onChange={handleChange('bio')}
                                    placeholder="Tell patients about yourself, your experience, and your approach to healthcare..."
                                    rows={4}
                                />

                                <Input
                                    label="Profile Image URL (Optional)"
                                    value={formData.profileImageUrl}
                                    onChange={handleChange('profileImageUrl')}
                                    placeholder="https://example.com/your-photo.jpg"
                                    icon={Upload}
                                />

                                {/* Summary */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <h4 className="font-semibold text-slate-900 mb-3">Profile Summary</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-slate-500">Specialization:</span>
                                            <p className="font-medium text-slate-900">{formData.specialization || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">License:</span>
                                            <p className="font-medium text-slate-900">{formData.licenseNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Experience:</span>
                                            <p className="font-medium text-slate-900">{formData.experience ? `${formData.experience} years` : '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Fee:</span>
                                            <p className="font-medium text-slate-900">{formData.consultationFee ? `Rs. ${formData.consultationFee}` : '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                                        <AlertCircle size={16} className="text-rose-600" />
                                        <p className="text-sm text-rose-700">{errors.submit}</p>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>
                                        <ArrowLeft size={16} />
                                        Back
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        loading={submitting}
                                        disabled={submitting}
                                    >
                                        <CheckCircle size={16} />
                                        {isEditMode ? 'Save Profile Changes' : 'Submit for Verification'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* Info Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        {isEditMode
                            ? 'Profile changes are synced immediately. Verification-sensitive fields may require admin review.'
                            : 'Your profile will be reviewed by our admin team. You\'ll be notified once approved.'}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorProfileSetup;
