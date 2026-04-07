import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { useNotifications } from '../../context/NotificationContext';
import { 
    Bell, Mail, MessageSquare, Smartphone, HelpCircle, 
    Save, RotateCcw, ShieldCheck, Info 
} from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationSettingsPage = () => {
    const { preferences, updatePreferences, loading } = useNotifications();
    const [localPrefs, setLocalPrefs] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (preferences) {
            setLocalPrefs({ ...preferences });
        }
    }, [preferences]);

    if (!localPrefs) {
        return (
            <DashboardLayout title="Notification Settings">
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-400">Loading Clinical Preferences...</p>
                </div>
            </DashboardLayout>
        );
    }

    const togglePref = (field) => {
        setLocalPrefs(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updatePreferences(localPrefs);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        {
            id: 'email',
            title: 'Electronic Mail (Email)',
            icon: Mail,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            mainField: 'emailEnabled',
            items: [
                { field: 'emailAppointmentConfirmation', label: 'Appointment Confirmations', desc: 'Detailed records for booking and rescheduling.' },
                { field: 'emailAppointmentReminder', label: 'Appointment Reminders', desc: 'Secure alerts 24h before clinical sessions.' },
                { field: 'emailPaymentConfirmation', label: 'Financial Statements', desc: 'Invoices and successful transaction logs.' },
                { field: 'emailPrescriptionReady', label: 'Prescription Digital Logs', desc: 'Alerts when doctors release medical orders.' },
                { field: 'emailTelemedicineSession', label: 'Session Access Bridges', desc: 'Direct links to start video consultations.' }
            ]
        },
        {
            id: 'whatsapp',
            title: 'WhatsApp Business',
            icon: MessageSquare,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            mainField: 'whatsappEnabled',
            items: [
                { field: 'whatsappAppointmentReminder', label: 'Appointment Pushes', desc: 'Instant WhatsApp alerts for upcoming visits.' },
                { field: 'whatsappTelemedicineSession', label: 'Session Quick-Links', desc: 'One-click WhatsApp access to video rooms.' },
                { field: 'whatsappPrescriptionReady', label: 'Pharmacy Alerts', desc: 'WhatsApp notifications for new prescriptions.' }
            ]
        },
        {
            id: 'sms',
            title: 'Short Message Service (SMS)',
            icon: Smartphone,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            mainField: 'smsEnabled',
            items: [
                { field: 'smsAppointmentReminder', label: 'Direct SMS Reminders', desc: 'Standard SMS alerts for clinical scheduling.' },
                { field: 'smsTelemedicineSession', label: 'Link Access via SMS', desc: 'Session bridge links sent to your mobile device.' }
            ]
        },
        {
            id: 'inapp',
            title: 'In-App Console',
            icon: Bell,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            mainField: 'inAppEnabled',
            items: [
                { field: 'inAppEnabled', label: 'Notification Bell', desc: 'The dashboard bell showing all unread clinical alerts.' }
            ]
        }
    ];

    return (
        <DashboardLayout title="Notification Settings">
            <Header 
                title="Privacy & Alert Controls" 
                subtitle="Choose exactly how SynapsCare reaches you. We prioritize your privacy and clinical record synchronization."
                breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications', path: '/notifications' }, { label: 'Settings' }]}
                actions={
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLocalPrefs({ ...preferences })}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                            title="Reset Changes"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 border border-slate-900 rounded-2xl text-white font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            Finalize Configuration
                        </button>
                    </div>
                }
            />

            <div className="mt-8 space-y-12 pb-32">
                {sections.map((section) => (
                    <div key={section.id} className="relative">
                        <div className="flex items-center justify-between mb-8 group">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${section.bg} ${section.color} border-2 border-white shadow-md transition-transform group-hover:scale-105`}>
                                    <section.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                                    <p className="text-sm font-medium text-slate-400">Master Switch for all {section.id} communications.</p>
                                </div>
                            </div>

                            <Toggle 
                                enabled={localPrefs[section.mainField]} 
                                onChange={() => togglePref(section.mainField)} 
                            />
                        </div>

                        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all ${!localPrefs[section.mainField] ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            {section.items.map((item) => (
                                <div key={item.field} className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                            <ShieldCheck size={20} className="text-slate-400 group-hover:text-indigo-600" />
                                        </div>
                                        <Toggle 
                                            enabled={localPrefs[item.field]} 
                                            onChange={() => togglePref(item.field)} 
                                            size="sm"
                                        />
                                    </div>
                                    <h5 className="font-black text-slate-800 tracking-tight mb-2">{item.label}</h5>
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed pr-4">{item.desc}</p>
                                    
                                    <div className="absolute 0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-slate-50/50 rounded-full blur-2xl pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl z-50 flex items-center gap-6 border border-white/10 backdrop-blur-md">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Info size={18} />
                 </div>
                 <div className="pr-4">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-0.5">Clinical Best Practice</p>
                    <p className="text-slate-300 text-xs font-bold leading-none">Keep Appointment Reminders enabled for critical care sync.</p>
                 </div>
            </div>
        </DashboardLayout>
    );
};

const Toggle = ({ enabled, onChange, size = 'lg' }) => {
    const isLarge = size === 'lg';
    return (
        <button
            onClick={onChange}
            className={`relative rounded-full transition-all flex items-center shrink-0 ${
                isLarge ? 'w-14 h-8 px-1.5' : 'w-10 h-6 px-1'
            } ${enabled ? 'bg-slate-900 shadow-inner' : 'bg-slate-200'}`}
        >
            <motion.div
                layout
                initial={false}
                animate={{ x: enabled ? (isLarge ? 24 : 16) : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'} bg-white rounded-full shadow-md z-10`}
            />
            {enabled && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[2px] pointer-events-none" />
            )}
        </button>
    );
};

export default NotificationSettingsPage;
