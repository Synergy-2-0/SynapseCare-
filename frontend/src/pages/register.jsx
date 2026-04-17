import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    CheckCircle2,
    UserRound,
    Stethoscope,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { authApi, fileUploadApi } from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { SPECIALIZATIONS, SPECIALIZATION_LABELS } from '../constants/specializations';

const RegisterPage = () => {
    const [role, setRole] = useState('PATIENT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        // Health Information
        bloodGroup: '',
        allergies: '',
        chronicIllnesses: '',
        height: '',
        weight: '',
        emergencyContact: '',
        dob: '',
        gender: '',
        profileImageUrl: ''
    });
    const [step, setStep] = useState(1);
    const [fieldErrors, setFieldErrors] = useState({});

    // Dropdown state
    const [showOtherAllergy, setShowOtherAllergy] = useState(false);
    const [showOtherIllness, setShowOtherIllness] = useState(false);

    const ALLERGY_OPTIONS = ['None', 'Peanuts', 'Dairy', 'Gluten', 'Penicillin', 'Pollen', 'Shellfish', 'Latex', 'Dust'];
    const ILLNESS_OPTIONS = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Heart Disease', 'Thyroid Disorder', 'Anxiety/Depression'];

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
        if (!formData.username.trim()) errors.username = 'Username is required.';
        if (!formData.email.trim()) errors.email = 'Email is required.';

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Contact number is required.';
        } else if (!formData.phoneNumber.startsWith('+')) {
            errors.phoneNumber = 'Number must start with +';
        } else if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 15) {
            errors.phoneNumber = 'Number must be between 10 and 15 characters';
        }

        if (!formData.password) {
            errors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }

        if (step === 2 && role === 'PATIENT') {
            if (!formData.bloodGroup) errors.bloodGroup = 'Blood group is required.';
            if (!formData.dob) errors.dob = 'Date of birth is required.';
            if (!formData.gender) errors.gender = 'Gender identity is required.';
            if (formData.height && (formData.height < 50 || formData.height > 250)) errors.height = 'Invalid height metric.';
            if (formData.weight && (formData.weight < 2 || formData.weight > 500)) errors.weight = 'Invalid weight metric.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        if (validateForm()) {
            if (role === 'PATIENT' && step === 1) {
                setStep(2);
            } else {
                handleRegister();
            }
        }
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();

        setLoading(true);
        setError('');
        try {
            const endpoint = role === 'PATIENT' ? '/register/patient' : '/register/doctor';
            const registerResponse = await authApi.post(endpoint, formData);

            if (role === 'DOCTOR') {
                const responseBody = registerResponse?.data || {};
                const data = responseBody?.data || responseBody;
                const user = data.user || responseBody.user || {};
                const token = data.accessToken || data.token || data.access_token || responseBody.accessToken || responseBody.token;
                const resolvedRole = user.role || data.role || 'DOCTOR';
                const userId = user.id ?? data.userId;
                const email = user.email || data.email || formData.email;
                const name = data.name || user.username || formData.firstName || 'Doctor';
                const verificationStatus = user.verificationStatus || 'PENDING';

                if (token) {
                    localStorage.setItem('auth_token', token);
                    if (resolvedRole) localStorage.setItem('user_role', resolvedRole);
                    if (email) localStorage.setItem('user_email', email);
                    if (userId !== undefined && userId !== null) localStorage.setItem('user_id', String(userId));
                    if (name) localStorage.setItem('user_name', name);
                    if (user.phoneNumber || data.phoneNumber || formData.phoneNumber) {
                        localStorage.setItem('user_phone', user.phoneNumber || data.phoneNumber || formData.phoneNumber);
                    }
                    if (verificationStatus) localStorage.setItem('user_verificationStatus', verificationStatus);

                    toast.success('Registration successful! Continue with your doctor profile setup.');
                    router.push('/doctor/setup');
                    return;
                }

                // Fallback for environments returning no auth token on register.
                toast.success('Successfully registered! Please sign in to continue your doctor profile setup.');
                router.push(`/login?registered=true&role=DOCTOR&email=${encodeURIComponent(formData.email.trim())}`);
                return;
            }

            toast.success("Successfully registered! You may now login and fill in your profile.");
            setTimeout(() => {
                router.push('/login?registered=true');
            }, 1500);
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && typeof backendErrors === 'object') {
                setFieldErrors(prev => ({ ...prev, ...backendErrors }));
            } else {
                setError(err.response?.data?.message || "Registration failed. Please check your details.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Create Account | Registration | SynapsCare</title>
                <meta name="description" content="Register as a patient or doctor on SynapseCare" />
            </Head>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent_500px)] pointer-events-none" />

                <div className="w-full max-w-6xl grid lg:grid-cols-[0.8fr_1.2fr] bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-200/50 relative z-10 min-h-[85vh]">
                    {/* Left Side: Onboarding Info */}
                    <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />

                        <Link href="/" className="flex items-center gap-3 relative z-10 transition-transform hover:scale-105 active:scale-95 w-fit">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 brightness-200" />
                            <span className="text-2xl font-black tracking-tighter text-white">Synapse<span className="text-indigo-400">Care</span></span>
                        </Link>

                        <div className="relative z-10 space-y-10">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={12} /> Smart Registration
                                </div>
                                <h1 className="text-4xl font-bold leading-tight tracking-tight">
                                    Set up your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">Health Profile.</span>
                                </h1>
                            </div>

                            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xs">
                                Join a global network of verified specialists and patient-centric care units.
                            </p>

                            <div className="space-y-5 pt-4">
                                {[
                                    'State-of-the-art data encryption',
                                    'Role-specific workspace toolkit',
                                    'Instant access to telemedicine grid'
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300 tracking-wide">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        </div>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <ShieldCheck size={16} className="text-indigo-500" />
                            <span>HIPAA & SOC2 Compliant Ecosystem</span>
                        </div>
                    </div>

                    {/* Right Side: Registration Form */}
                    <div className="p-8 md:p-14 lg:p-16 flex flex-col">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-slate-900 tracking-tighter mb-4">Create Account</h2>
                                <p className="copy-description font-medium">Select your role to start your setup.</p>
                            </div>

                            {/* Role Selector */}
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {[
                                    { id: 'PATIENT', label: 'Patient', icon: UserRound, desc: 'Receive care' },
                                    { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope, desc: 'Provide care' }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRole(r.id)}
                                        className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-4 group ${role === r.id
                                                ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-100'
                                                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === r.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                            }`}>
                                            <r.icon size={22} />
                                        </div>
                                        <div>
                                            <div className={`font-black text-sm uppercase tracking-wider ${role === r.id ? 'text-indigo-900' : 'text-slate-600'}`}>{r.label}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{r.desc}</div>
                                        </div>
                                        {role === r.id && (
                                            <div className="absolute top-4 right-4 text-indigo-600">
                                                <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">!</div>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-8">
                                {step === 1 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">First Name</label>
                                            <input
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className={`input-field ${fieldErrors.firstName ? 'border-rose-500' : ''}`}
                                            />
                                            {fieldErrors.firstName && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.firstName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Last Name</label>
                                            <input
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className={`input-field ${fieldErrors.lastName ? 'border-rose-500' : ''}`}
                                            />
                                            {fieldErrors.lastName && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.lastName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Username</label>
                                            <input
                                                placeholder="johndoe_123"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className={`input-field ${fieldErrors.username ? 'border-rose-500' : ''}`}
                                            />
                                            {fieldErrors.username && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.username}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+15550000000"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                className={`input-field ${fieldErrors.phoneNumber ? 'border-rose-500' : ''}`}
                                            />
                                            {fieldErrors.phoneNumber && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.phoneNumber}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="user@synapsecare.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`input-field ${fieldErrors.email ? 'border-rose-500' : ''}`}
                                            />
                                            {fieldErrors.email && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.email}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Password (8+ Chars)</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`input-field ${fieldErrors.password ? 'border-rose-500' : ''}`}
                                            />
                                            {fieldErrors.password && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.password}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Blood Group</label>
                                            <select
                                                value={formData.bloodGroup}
                                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="">Select Group</option>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                    <option key={bg} value={bg}>{bg}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Height (cm)</label>
                                            <input
                                                type="number"
                                                placeholder="175"
                                                value={formData.height}
                                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Weight (kg)</label>
                                            <input
                                                type="number"
                                                placeholder="70"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Gender Identity</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Emergency Contact</label>
                                            <input
                                                placeholder="Name or Phone Number"
                                                value={formData.emergencyContact}
                                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Allergies</label>
                                            <select
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setShowOtherAllergy(true);
                                                        setFormData({ ...formData, allergies: '' });
                                                    } else {
                                                        setShowOtherAllergy(false);
                                                        setFormData({ ...formData, allergies: val });
                                                    }
                                                }}
                                                className="input-field"
                                            >
                                                <option value="">Select Allergy</option>
                                                {ALLERGY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other (Type below)</option>
                                            </select>
                                            {showOtherAllergy && (
                                                <input
                                                    placeholder="Specify Allergy"
                                                    value={formData.allergies}
                                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                                    className="input-field mt-2"
                                                />
                                            )}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Chronic Illnesses</label>
                                            <select
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setShowOtherIllness(true);
                                                        setFormData({ ...formData, chronicIllnesses: '' });
                                                    } else {
                                                        setShowOtherIllness(false);
                                                        setFormData({ ...formData, chronicIllnesses: val });
                                                    }
                                                }}
                                                className="input-field"
                                            >
                                                <option value="">Select Condition</option>
                                                {ILLNESS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other (Type below)</option>
                                            </select>
                                            {showOtherIllness && (
                                                <input
                                                    placeholder="Specify Condition"
                                                    value={formData.chronicIllnesses}
                                                    onChange={(e) => setFormData({ ...formData, chronicIllnesses: e.target.value })}
                                                    className="input-field mt-2"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="md:col-span-2 pt-4 flex gap-4">
                                    {step === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="h-14 px-8 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        disabled={loading}
                                        className="btn-primary flex-1 flex items-center justify-center gap-3 py-4 text-base font-bold group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {step === 1 && role === 'PATIENT' ? 'Next: Health Info' : 'Complete Registration'}
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-slate-500 font-bold text-sm">
                                    Already have an account? <br className="sm:hidden" />
                                    <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors ml-1 uppercase tracking-wider text-xs">Sign In</Link>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
