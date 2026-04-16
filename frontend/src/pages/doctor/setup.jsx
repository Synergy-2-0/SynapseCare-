import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { doctorApi } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { SPECIALIZATIONS, SPECIALIZATION_LABELS } from '../../constants/specializations';
import { normalizeVerificationStatus, VERIFICATION_STATUS } from '../../lib/doctorVerification';

export default function DoctorSetupPage() {
    const router = useRouter();

    // Status states
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(VERIFICATION_STATUS.PENDING);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showForm, setShowForm] = useState(true);

    // File states
    const [licenseFile, setLicenseFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [existingProfileImageUrl, setExistingProfileImageUrl] = useState(null);
    const [existingLicenseDocumentUrl, setExistingLicenseDocumentUrl] = useState(null);

    // Form fields mapped to Doctor.java & CreateDoctorProfileRequest
    const [formData, setFormData] = useState({
        specialization: '',
        qualifications: '',
        experience: '',
        licenseNumber: '',
        consultationFee: '',
        bio: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});

    // Dropdown/Other state
    const [showOtherSpec, setShowOtherSpec] = useState(false);
    const [showOtherQual, setShowOtherQual] = useState(false);
    const [licensePrefix, setLicensePrefix] = useState('');
    const [showOtherPrefix, setShowOtherPrefix] = useState(false);
    const [customPrefix, setCustomPrefix] = useState('');
    const [licenseSuffix, setLicenseSuffix] = useState('');

    const QUAL_OPTIONS = ['MD', 'MBBS', 'PhD', 'MS', 'BDS', 'DNB', 'DO', 'DPM'];
    const LIC_PREFIX_OPTIONS = ['SLMC', 'GMC', 'PMC', 'DMC', 'KMC'];

    useEffect(() => {
        const fetchInitialProfile = async () => {
            try {
                const res = await doctorApi.get('/profile/me');
                if (res.data) {
                    setHasExistingProfile(Boolean(res.data.id));
                    setFormData({
                        specialization: res.data.specialization || '',
                        qualifications: res.data.qualifications || '',
                        experience: res.data.experience || '',
                        licenseNumber: res.data.licenseNumber || '',
                        consultationFee: res.data.consultationFee || '',
                        bio: res.data.bio || ''
                    });

                    const normalizedStatus = normalizeVerificationStatus(res.data.verificationStatus);
                    const hasCompletedSubmission = Boolean(
                        res.data.specialization
                        && res.data.licenseNumber
                        && res.data.consultationFee
                    );

                    const reasonFromApi = [
                        res.data.verificationRejectionReason,
                        res.data.rejectionReason,
                        res.data.verificationReason
                    ].find(Boolean) || '';

                    setVerificationStatus(normalizedStatus);
                    setRejectionReason(reasonFromApi);
                    setShowForm(
                        normalizedStatus === VERIFICATION_STATUS.APPROVED
                            ? false
                            : normalizedStatus === VERIFICATION_STATUS.PENDING
                                ? !hasCompletedSubmission
                                : false
                    );

                    if (normalizedStatus === VERIFICATION_STATUS.APPROVED) {
                        localStorage.setItem('user_verificationStatus', VERIFICATION_STATUS.APPROVED);
                    }

                    if (res.data.profileImageUrl) {
                        setPhotoPreview(res.data.profileImageUrl);
                        setExistingProfileImageUrl(res.data.profileImageUrl);
                        localStorage.setItem('user_image', res.data.profileImageUrl);
                    }

                    if (res.data.licenseNumber) {
                        const parts = res.data.licenseNumber.split('-');
                        if (parts.length > 1) {
                            const pref = parts[0];
                            const suff = parts.slice(1).join('-');
                            if (LIC_PREFIX_OPTIONS.includes(pref)) {
                                setLicensePrefix(pref);
                                setLicenseSuffix(suff);
                            } else {
                                setLicensePrefix('Other');
                                setShowOtherPrefix(true);
                                setCustomPrefix(pref);
                                setLicenseSuffix(suff);
                            }
                        } else {
                            setLicenseSuffix(res.data.licenseNumber);
                        }
                    }

                    if (res.data.licenseDocumentUrl) {
                        setExistingLicenseDocumentUrl(res.data.licenseDocumentUrl);
                    }
                }
            } catch {
                console.log("No profile found yet, using empty form");
            } finally {
                setIsProfileLoaded(true);
            }
        };
        fetchInitialProfile();
    }, []);

    useEffect(() => {
        if (verificationStatus !== VERIFICATION_STATUS.PENDING || showForm) {
            return;
        }

        const timer = setInterval(async () => {
            try {
                const res = await doctorApi.get('/profile/me');
                const normalizedStatus = normalizeVerificationStatus(res?.data?.verificationStatus);
                const reasonFromApi = [
                    res?.data?.verificationRejectionReason,
                    res?.data?.rejectionReason,
                    res?.data?.verificationReason
                ].find(Boolean) || '';

                setVerificationStatus(normalizedStatus);
                setRejectionReason(reasonFromApi);

                if (normalizedStatus === VERIFICATION_STATUS.APPROVED) {
                    localStorage.setItem('user_verificationStatus', VERIFICATION_STATUS.APPROVED);
                    toast.success('Verification approved. Redirecting to dashboard...');
                    router.push('/doctor/dashboard');
                }
            } catch {
                // Keep silent for interval retries
            }
        }, 30000);

        return () => clearInterval(timer);
    }, [verificationStatus, showForm, router]);

    // Refs for hidden inputs
    const licenseInputRef = useRef(null);
    const photoInputRef = useRef(null);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'license') {
            setLicenseFile(file);
        } else if (type === 'photo') {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let cleanValue = value;
        
        // Strict Numeric Filtering & Real-time Validation
        if (name === 'experience') {
            cleanValue = value.replace(/[^0-9]/g, '');
            if (cleanValue !== '' && parseInt(cleanValue) > 60) {
                setFieldErrors(prev => ({ ...prev, experience: 'Experience cannot exceed 60 years.' }));
                // Don't returned, still set value but capped or just let them type and show error
            } else {
                setFieldErrors(prev => ({ ...prev, experience: null }));
            }
        }
        
        if (name === 'consultationFee') {
            cleanValue = value.replace(/[^0-9.]/g, '');
            const parts = cleanValue.split('.');
            if (parts.length > 2) return; 
            
            const fee = parseFloat(cleanValue);
            if (!isNaN(fee) && fee > 10000) {
                setFieldErrors(prev => ({ ...prev, consultationFee: 'Fee cannot exceed $10,000.' }));
            } else if (!isNaN(fee) && fee <= 0) {
                setFieldErrors(prev => ({ ...prev, consultationFee: 'Fee must be greater than 0.' }));
            } else {
                setFieldErrors(prev => ({ ...prev, consultationFee: null }));
            }
        }

        // General Real-time Validation for other fields
        if (name === 'licenseNumber' || name === 'licenseNumberSuffix') {
             setFieldErrors(prev => ({ ...prev, licenseNumber: null }));
        }

        if (name === 'specialization' && cleanValue) {
             setFieldErrors(prev => ({ ...prev, specialization: null }));
        }

        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        let errors = {};
        
        // Build final license number
        const finalPrefix = licensePrefix === 'Other' ? customPrefix : licensePrefix;
        const finalLicenseNumber = finalPrefix ? `${finalPrefix}-${licenseSuffix}` : licenseSuffix;

        if (!finalLicenseNumber?.trim()) errors.licenseNumber = "Medical License Number is required.";
        if (!formData.specialization) errors.specialization = "Specialization is required.";
        
        // Fee Validation
        const fee = parseFloat(formData.consultationFee);
        if (isNaN(fee)) {
            errors.consultationFee = "Please enter a valid amount.";
        } else if (fee <= 0) {
            errors.consultationFee = "Consultation Fee must be greater than 0.";
        }
        
        // Experience Validation
        const expValue = formData.experience === '' ? 0 : parseInt(formData.experience);
        if (isNaN(expValue)) {
            errors.experience = "Please enter a valid number.";
        } else if (expValue < 0) {
            errors.experience = "Experience cannot be negative.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error("Please correct the errors before submitting.");
            return;
        }

        setIsLoading(true);

        try {
            let profileImageUrl = photoPreview;
            let licenseImageUrl = null;

            // Update main formData with final combined license
            const updatedFormData = { ...formData, licenseNumber: finalLicenseNumber };

            // Helper for Cloudinary Unsigned Upload
            const uploadToCloudinary = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'synapcare_preset');
                
                // Now that PDF delivery is enabled, we categorize by MIME type
                const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'; 
                formData.append('resource_type', resourceType);
                
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dao7fkewx';

                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (!response.ok || !result.secure_url) {
                    throw new Error(result?.error?.message || 'Failed to upload to clinical-media registry');
                }

                return result.secure_url;
            };

            // 1. Upload files if selected
            if (photoFile) {
                profileImageUrl = await uploadToCloudinary(photoFile);
            }

            if (licenseFile) {
                licenseImageUrl = await uploadToCloudinary(licenseFile);
            }

            // 2. Build payload — use Cloudinary URL if upload
            // 2. Build payload — use Cloudinary URL if uploaded, else existing DB URL
            const finalProfileImageUrl = photoFile ? profileImageUrl : existingProfileImageUrl;
            const finalLicenseImageUrl = licenseFile ? licenseImageUrl : existingLicenseDocumentUrl;

            const payload = {
                ...updatedFormData,
                profileImageUrl: finalProfileImageUrl,
                licenseDocumentUrl: finalLicenseImageUrl,
                experience: parseInt(formData.experience) || 0,
                consultationFee: parseFloat(formData.consultationFee) || 0
            };

            if (finalProfileImageUrl) {
                localStorage.setItem('user_image', finalProfileImageUrl);
            }

            let profileResponse;
            if (hasExistingProfile) {
                profileResponse = await doctorApi.put('/profile', payload);
            } else {
                profileResponse = await doctorApi.post('/profile', payload);
                setHasExistingProfile(true);
            }

            const normalizedStatus = normalizeVerificationStatus(profileResponse?.data?.verificationStatus);

            setVerificationStatus(normalizedStatus);
            setShowForm(normalizedStatus !== VERIFICATION_STATUS.APPROVED);
            setRejectionReason('');

            if (normalizedStatus === VERIFICATION_STATUS.APPROVED) {
                localStorage.setItem('user_verificationStatus', VERIFICATION_STATUS.APPROVED);
                toast.success('Profile saved. Verification already approved. Redirecting...');
                router.push('/doctor/dashboard');
                return;
            }

            localStorage.setItem('user_verificationStatus', VERIFICATION_STATUS.PENDING);
            setShowForm(false);

            toast.success("Profile submitted successfully!");
        } catch (err) {
            console.error("Submission error:", err);
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && typeof backendErrors === 'object') {
                setFieldErrors(backendErrors);
            } else {
                toast.error(err.response?.data?.message || "Failed to submit profile. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshStatus = async () => {
        try {
            const res = await doctorApi.get('/profile/me');
            const normalizedStatus = normalizeVerificationStatus(res?.data?.verificationStatus);
            const reasonFromApi = [
                res?.data?.verificationRejectionReason,
                res?.data?.rejectionReason,
                res?.data?.verificationReason
            ].find(Boolean) || '';

            const hasCompletedSubmission = Boolean(
                res?.data?.specialization
                && res?.data?.licenseNumber
                && res?.data?.consultationFee
            );

            setVerificationStatus(normalizedStatus);
            setRejectionReason(reasonFromApi);

            if (normalizedStatus === VERIFICATION_STATUS.APPROVED) {
                localStorage.setItem('user_verificationStatus', VERIFICATION_STATUS.APPROVED);
                toast.success('Verification approved. Redirecting to dashboard...');
                router.push('/doctor/dashboard');
                return;
            }

            setShowForm(
                normalizedStatus === VERIFICATION_STATUS.APPROVED
                    ? false
                    : normalizedStatus === VERIFICATION_STATUS.PENDING
                        ? !hasCompletedSubmission
                        : false
            );
        } catch {
            toast.error('Unable to refresh verification status right now.');
        }
    };

    if (!isProfileLoaded) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Toaster position="top-right" />
            {/* Header with Logout */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-teal-500">
                        SynapCare
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </header>

            <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-10"
                >
                    <div className="bg-teal-600 px-8 py-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-4 border-white"></div>
                            <div className="absolute right-20 -bottom-10 w-32 h-32 rounded-full border-4 border-white"></div>
                        </div>

                        <div className="relative z-10 flex items-center gap-4 mb-2">
                            <AlertCircle className="w-8 h-8 text-teal-100" />
                            <h2 className="text-3xl font-serif font-bold">Complete Your Profile</h2>
                        </div>
                        <p className="text-teal-50 text-lg relative z-10">
                            Provide your professional details to establish your doctor account for review.
                        </p>
                    </div>

                    <div className="p-8">
                        {!showForm ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${verificationStatus === VERIFICATION_STATUS.REJECTED ? 'bg-rose-50 border-rose-200' : verificationStatus === VERIFICATION_STATUS.APPROVED ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} border p-8 rounded-xl text-center shadow-inner`}
                            >
                                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm border ${verificationStatus === VERIFICATION_STATUS.REJECTED ? 'bg-rose-100 border-rose-200' : verificationStatus === VERIFICATION_STATUS.APPROVED ? 'bg-emerald-100 border-emerald-200' : 'bg-amber-100 border-amber-200'}`}>
                                    {verificationStatus === VERIFICATION_STATUS.APPROVED ? (
                                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                                    ) : (
                                        <AlertCircle className={`w-8 h-8 ${verificationStatus === VERIFICATION_STATUS.REJECTED ? 'text-rose-600' : 'text-amber-600'}`} />
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                    {verificationStatus === VERIFICATION_STATUS.REJECTED
                                        ? 'Verification Needs Updates'
                                        : verificationStatus === VERIFICATION_STATUS.APPROVED
                                            ? 'Verification Approved'
                                            : 'Pending Admin Verification'}
                                </h3>
                                <p className="text-slate-600 text-base leading-relaxed max-w-lg mx-auto mb-6">
                                    {verificationStatus === VERIFICATION_STATUS.REJECTED
                                        ? 'Your profile needs corrections before approval. Click Fix & Resubmit to update details and submit again.'
                                        : verificationStatus === VERIFICATION_STATUS.APPROVED
                                            ? 'Your account has full doctor access now. Continue to your dashboard.'
                                            : 'Your professional profile is under review. Expected review time is within 24 to 48 hours.'}
                                </p>
                                {verificationStatus === VERIFICATION_STATUS.REJECTED && (
                                    <p className="text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-lg px-4 py-3 mb-5 max-w-xl mx-auto">
                                        Rejection reason: {rejectionReason || 'Reason not provided by backend response.'}
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <div className={`inline-block bg-white px-6 py-3 rounded-lg text-sm shadow-sm font-medium font-mono ${verificationStatus === VERIFICATION_STATUS.REJECTED ? 'border border-rose-100 text-rose-800' : verificationStatus === VERIFICATION_STATUS.APPROVED ? 'border border-emerald-100 text-emerald-800' : 'border border-amber-100 text-amber-800'}`}>
                                        Status: {verificationStatus === VERIFICATION_STATUS.PENDING ? 'UNDER REVIEW' : verificationStatus.replace(/_/g, ' ')}
                                    </div>
                                    {verificationStatus === VERIFICATION_STATUS.APPROVED ? (
                                        <button
                                            onClick={() => router.push('/doctor/dashboard')}
                                            className="text-sm font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-2"
                                        >
                                            Go to Doctor Dashboard
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleRefreshStatus}
                                                className="text-sm font-semibold text-slate-600 hover:text-slate-700 underline underline-offset-2"
                                            >
                                                Refresh Status
                                            </button>
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="text-sm font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-2"
                                            >
                                                {verificationStatus === VERIFICATION_STATUS.REJECTED ? 'Fix & Resubmit' : 'Edit Allowed Fields'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-8">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Form Fields */}
                                    <div className="space-y-5">
                                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Professional Details</h3>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Medical License Number *</label>
                                            <div className="flex gap-2 mb-2">
                                                <select
                                                    value={licensePrefix}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setLicensePrefix(val);
                                                        setShowOtherPrefix(val === 'Other');
                                                        if (val !== 'Other') setCustomPrefix('');
                                                    }}
                                                    className={`w-1/3 bg-slate-50 border ${fieldErrors.licenseNumber ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 transition-all text-sm`}
                                                >
                                                    <option value="">Prefix</option>
                                                    {LIC_PREFIX_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    <option value="Other">Other</option>
                                                </select>
                                                <input
                                                    placeholder="License Digits"
                                                    value={licenseSuffix}
                                                    onChange={(e) => setLicenseSuffix(e.target.value)}
                                                    className={`flex-1 bg-slate-50 border ${fieldErrors.licenseNumber ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-all`}
                                                />
                                            </div>
                                            {showOtherPrefix && (
                                                <input
                                                    placeholder="Specify Prefix (e.g., STATE-MED)"
                                                    value={customPrefix}
                                                    onChange={(e) => setCustomPrefix(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mb-2 outline-none focus:border-teal-500 transition-all text-sm"
                                                />
                                            )}
                                            {fieldErrors.licenseNumber && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{fieldErrors.licenseNumber}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Specialization *</label>
                                            <select
                                                required
                                                name="specialization"
                                                value={showOtherSpec ? 'Other' : formData.specialization}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setShowOtherSpec(true);
                                                        setFormData({ ...formData, specialization: '' });
                                                    } else {
                                                        setShowOtherSpec(false);
                                                        setFormData({ ...formData, specialization: val });
                                                    }
                                                }}
                                                className={`w-full bg-slate-50 border ${fieldErrors.specialization ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all appearance-none cursor-pointer`}
                                            >
                                                <option value="" disabled>Select Specialization</option>
                                                {SPECIALIZATIONS.map(spec => (
                                                    <option key={spec} value={spec}>
                                                        {SPECIALIZATION_LABELS[spec]}
                                                    </option>
                                                ))}
                                                <option value="Other">Other (Specify below)</option>
                                            </select>
                                            {showOtherSpec && (
                                                <input
                                                    placeholder="Specify Specialization"
                                                    value={formData.specialization}
                                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-2 outline-none focus:border-teal-500 transition-all"
                                                />
                                            )}
                                            {fieldErrors.specialization && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{fieldErrors.specialization}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Qualifications *</label>
                                            <select
                                                required
                                                value={showOtherQual ? 'Other' : formData.qualifications}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setShowOtherQual(true);
                                                        setFormData({ ...formData, qualifications: '' });
                                                    } else {
                                                        setShowOtherQual(false);
                                                        setFormData({ ...formData, qualifications: val });
                                                    }
                                                }}
                                                className={`w-full bg-slate-50 border ${fieldErrors.qualifications ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer`}
                                            >
                                                <option value="" disabled>Select Qualification</option>
                                                {QUAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other (Specify below)</option>
                                            </select>
                                            {showOtherQual && (
                                                <input
                                                    placeholder="Specify Qualifications (e.g. MD, MBBS)"
                                                    value={formData.qualifications}
                                                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-2 outline-none focus:border-teal-500 transition-all"
                                                />
                                            )}
                                            {fieldErrors.qualifications && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{fieldErrors.qualifications}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Years of Experience</label>
                                                <input name="experience" value={formData.experience} onChange={handleInputChange} type="number" min="0" className={`w-full bg-slate-50 border ${fieldErrors.experience ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`} placeholder="0" />
                                                {fieldErrors.experience && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{fieldErrors.experience}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Consultation Fee ($) *</label>
                                                <input required name="consultationFee" value={formData.consultationFee} onChange={handleInputChange} type="number" step="0.01" min="0.01" className={`w-full bg-slate-50 border ${fieldErrors.consultationFee ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`} placeholder="150.00" />
                                                {fieldErrors.consultationFee && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{fieldErrors.consultationFee}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Professional Bio</label>
                                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className={`w-full bg-slate-50 border ${fieldErrors.bio ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none`} placeholder="Briefly describe your background, approach to patient care, etc."></textarea>
                                            {fieldErrors.bio && <p className="text-rose-500 text-xs font-semibold mt-1 ml-1">{fieldErrors.bio}</p>}
                                        </div>
                                    </div>

                                    {/* Right Column: Files Upload */}
                                    <div className="space-y-5">
                                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Documents & Photo</h3>

                                        {/* Profile Photo */}
                                        <div
                                            onClick={() => photoInputRef.current?.click()}
                                            className={`flex p-4 border-2 ${photoFile ? 'border-teal-500 bg-teal-50/50' : 'border-dashed border-slate-300 hover:bg-slate-50'} rounded-xl transition-colors cursor-pointer group items-center gap-4`}
                                        >
                                            <input type="file" ref={photoInputRef} onChange={(e) => handleFileSelect(e, 'photo')} accept=".jpg,.jpeg,.png" className="hidden" />

                                            <div className="flex-shrink-0">
                                                {photoPreview ? (
                                                    <Image
                                                        src={photoPreview}
                                                        alt="Preview"
                                                        width={64}
                                                        height={64}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-bold text-sm">Profile Photo *</p>
                                                <p className="text-slate-500 text-xs mt-0.5">{photoFile ? photoFile.name : 'Standard headshot (JPG/PNG)'}</p>
                                            </div>
                                        </div>

                                        {/* Medical License */}
                                        <div
                                            onClick={() => licenseInputRef.current?.click()}
                                            className={`flex p-4 border-2 ${licenseFile || existingLicenseDocumentUrl ? 'border-teal-500 bg-teal-50/50' : 'border-dashed border-slate-300 hover:bg-slate-50'} rounded-xl transition-colors cursor-pointer group items-center gap-4`}
                                        >
                                            <input type="file" ref={licenseInputRef} onChange={(e) => handleFileSelect(e, 'license')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />

                                            <div className="flex-shrink-0">
                                                {/* Visual Preview logic for License */}
                                                {licenseFile && licenseFile.type.startsWith('image/') ? (
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                                        <img src={URL.createObjectURL(licenseFile)} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : existingLicenseDocumentUrl ? (
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-white flex items-center justify-center">
                                                        {existingLicenseDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                                                            <Image 
                                                                src={existingLicenseDocumentUrl.replace(/\.pdf$/i, '.jpg')} 
                                                                alt="PDF Preview" 
                                                                width={64} 
                                                                height={64} 
                                                                className="w-full h-full object-cover opacity-80"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <Image src={existingLicenseDocumentUrl} alt="License" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${licenseFile ? 'bg-teal-100' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                                                        <FileText className={`w-6 h-6 ${licenseFile ? 'text-teal-600' : 'text-slate-400'}`} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-slate-700 font-bold text-sm">Medical License Document *</p>
                                                <p className="text-slate-500 text-xs mt-0.5 truncate">{licenseFile ? licenseFile.name : (existingLicenseDocumentUrl ? 'Update existing document' : 'PDF, JPG, or PNG (Max 10MB)')}</p>
                                            </div>
                                            {(licenseFile || existingLicenseDocumentUrl) && <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 ml-2" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                        {isLoading ? 'Submitting...' : 'Submit Profile for Review'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}