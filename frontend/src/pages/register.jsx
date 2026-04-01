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
import { authApi } from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';

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
    });
    const [fieldErrors, setFieldErrors] = useState({});

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

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const endpoint = role === 'PATIENT' ? '/register/patient' : '/register/doctor';
            await authApi.post(endpoint, formData);
            
            toast.success("Successfully registered! You may now login and fill in your profile.");
            setTimeout(() => {
                router.push('/login?registered=true');
            }, 1500);
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && typeof backendErrors === 'object') {
                setFieldErrors(prev => ({...prev, ...backendErrors}));
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
                <title>Create Identity | Clinical Registration | SynapsCare</title>
                <meta name="description" content="Register as a patient or practitioner on the world's most advanced healthcare network" />
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
                                <Sparkles size={12} /> Adaptive Onboarding
                            </div>
                            <h1 className="text-4xl font-black leading-tight tracking-tight">
                                Establish your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">Medical Identity.</span>
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
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Create Account</h2>
                            <p className="copy-description font-medium">Select your role to begin the clinical setup.</p>
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
                                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-4 group ${
                                        role === r.id 
                                        ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-100' 
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                        role === r.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
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

                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">First Name</label>
                                <input
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className={`input-field ${fieldErrors.firstName ? 'border-rose-500' : ''}`}
                                />
                                {fieldErrors.firstName && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.firstName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Last Name</label>
                                <input
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className={`input-field ${fieldErrors.lastName ? 'border-rose-500' : ''}`}
                                />
                                {fieldErrors.lastName && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.lastName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Username</label>
                                <input
                                    placeholder="johndoe_123"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className={`input-field ${fieldErrors.username ? 'border-rose-500' : ''}`}
                                />
                                {fieldErrors.username && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.username}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Contact Terminal</label>
                                <input
                                    type="tel"
                                    placeholder="+15550000000"
                                    maxLength="15"
                                    pattern="^\+[1-9]\d{1,14}$"
                                    title="Phone number must start with + and contain only numbers (up to 15 digits)"
                                    onKeyPress={(e) => {
                                        if (e.target.value.length === 0 && e.key !== '+') {
                                            e.preventDefault();
                                        }
                                        if (e.target.value.length > 0 && !/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    className={`input-field ${fieldErrors.phoneNumber ? 'border-rose-500' : ''}`}
                                />
                                {fieldErrors.phoneNumber && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.phoneNumber}</p>}
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email Node</label>
                                <input
                                    type="email"
                                    placeholder="user@synapsecare.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={`input-field ${fieldErrors.email ? 'border-rose-500' : ''}`}
                                />
                                {fieldErrors.email && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.email}</p>}
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Access Pass (8+ Chars)</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className={`input-field ${fieldErrors.password ? 'border-rose-500' : ''}`}
                                />
                                {fieldErrors.password && <p className="text-rose-500 text-xs font-semibold ml-1">{fieldErrors.password}</p>}
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base font-bold group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Complete Clinical Onboarding
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-slate-500 font-bold text-sm">
                                Already identified? <br className="sm:hidden" />
                                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors ml-1 uppercase tracking-wider text-xs">Sign In to Dashboard</Link>
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
