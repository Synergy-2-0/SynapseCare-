import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CircleCheckBig, ChevronRight, UserRound, Stethoscope } from 'lucide-react';
import { authApi } from '../lib/api';

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
        specialization: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = role === 'PATIENT' ? '/register/patient' : '/register/doctor';
            await authApi.post(endpoint, formData);
            router.push('/login?registered=true');
        } catch (err) {
            console.error("Registration failed", err);
            setError(err.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-[var(--color-text)] bg-[var(--color-bg)]">
            <div className="section-shell py-8 md:py-12">
                <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-strong)]">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="relative bg-[#0f2d4e] p-8 md:p-10 text-white">
                            <div className="absolute inset-0 bg-[radial-gradient(700px_320px_at_10%_0%,rgba(19,102,217,0.45),transparent)]" />
                            <div className="relative flex h-full flex-col justify-between gap-12">
                                <Link href="/" className="flex items-center gap-3">
                                    <img src="/logo.png" alt="SynapseCare" className="w-10 h-10" />
                                    <span className="text-2xl font-semibold">SynapseCare</span>
                                </Link>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-semibold leading-tight">Start your secure healthcare account.</h1>
                                    <p className="mt-4 text-slate-200 max-w-sm">
                                        Role-based onboarding for patients and doctors with secure authentication and profile-ready access.
                                    </p>
                                    <div className="mt-8 space-y-3 text-sm text-slate-200">
                                        {['Protected identity and records', 'Role-aware clinical workflow setup', 'Fast onboarding with secure defaults'].map((item) => (
                                            <div key={item} className="flex items-center gap-2">
                                                <CircleCheckBig className="w-4 h-4 text-[#7ac5ff]" /> {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-300">Healthcare identity onboarding • v3</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 lg:p-12">
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-2xl mx-auto">
                                <h2 className="text-3xl font-semibold tracking-tight">Create account</h2>
                                <p className="copy-muted mt-2">Select your role and complete the registration form.</p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { id: 'PATIENT', label: 'Patient', desc: 'Book care and manage records', icon: UserRound },
                                        { id: 'DOCTOR', label: 'Doctor', desc: 'Manage consultations and schedules', icon: Stethoscope }
                                    ].map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setRole(r.id)}
                                            type="button"
                                            className={`p-4 rounded-[var(--radius-md)] border transition-all text-left ${role === r.id ? 'border-[var(--color-primary)] bg-blue-50 soft-ring' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                                        >
                                            <r.icon className={`w-5 h-5 mb-2 ${role === r.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                                            <div className="font-semibold">{r.label}</div>
                                            <div className="text-xs mt-1 copy-muted">{r.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {error && (
                                    <div className="mt-5 rounded-[var(--radius-sm)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleRegister} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">First Name</label>
                                        <input value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} placeholder="John" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Last Name</label>
                                        <input value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} placeholder="Doe" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Username</label>
                                        <input value={formData.username} onChange={(e)=>setFormData({...formData, username: e.target.value})} placeholder="johndoe123" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Phone Number</label>
                                        <input value={formData.phoneNumber} onChange={(e)=>setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1234567890" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Email Address</label>
                                        <input value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} type="email" placeholder="john@gmail.com" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Password (8+ chars)</label>
                                        <input value={formData.password} onChange={(e)=>setFormData({...formData, password: e.target.value})} type="password" placeholder="••••••••" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required minLength={8} />
                                    </div>

                                    {role === 'DOCTOR' && (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Specialization</label>
                                            <input value={formData.specialization} onChange={(e)=>setFormData({...formData, specialization: e.target.value})} placeholder="Cardiologist" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white py-3 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all" required />
                                        </div>
                                    )}

                                    <div className="md:col-span-2 pt-2">
                                        <button disabled={loading} className="w-full py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-semibold text-sm shadow-[var(--shadow-soft)] transition-all flex items-center justify-center gap-2 hover:bg-[var(--color-primary-strong)] disabled:opacity-50">
                                            {loading ? 'Creating Account...' : <>Complete Sign Up <ChevronRight className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                </form>

                                <p className="text-center text-sm copy-muted mt-6">
                                    Already have an account? <Link href="/login" className="text-[var(--color-primary)] font-semibold">Sign In</Link>
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
