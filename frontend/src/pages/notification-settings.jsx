import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Bell, Mail, MessageSquare, 
    Save, AlertCircle
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import useToast from '../hooks/useToast';

/**
 * NotificationSettingsPage
 * 
 * Page for managing notification preferences
 */
const NotificationSettingsPage = () => {
    const { preferences, updatePreferences } = useNotifications();
    const { showToast } = useToast();
    const [localPreferences, setLocalPreferences] = useState(null);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize local preferences from context
    useEffect(() => {
        if (preferences) {
            setLocalPreferences(preferences);
        }
    }, [preferences]);

    // Track changes
    useEffect(() => {
        if (preferences && localPreferences) {
            const changed = JSON.stringify(preferences) !== JSON.stringify(localPreferences);
            setHasChanges(changed);
        }
    }, [preferences, localPreferences]);

    // Handle toggle change
    const handleToggle = (key) => {
        setLocalPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Handle master toggle
    const handleMasterToggle = (prefix) => {
        const masterKey = `${prefix}Enabled`;
        const newValue = !localPreferences[masterKey];
        
        setLocalPreferences(prev => {
            const updated = { ...prev, [masterKey]: newValue };
            
            // If disabling, keep sub-preferences as is
            // If enabling, we don't need to change sub-preferences
            
            return updated;
        });
    };

    // Save preferences
    const handleSave = async () => {
        setSaving(true);
        try {
            await updatePreferences(localPreferences);
            showToast('success', 'Notification preferences saved successfully');
            setHasChanges(false);
        } catch (error) {
            showToast('error', 'Failed to save preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Preference sections
    const sections = [
        {
            id: 'email',
            title: 'Email Notifications',
            icon: Mail,
            description: 'Receive notifications via email',
            masterKey: 'emailEnabled',
            options: [
                { key: 'emailAppointmentConfirmation', label: 'Appointment confirmations', description: 'When your appointment is confirmed' },
                { key: 'emailAppointmentReminder', label: 'Appointment reminders', description: 'Reminder before your scheduled appointments' },
                { key: 'emailPaymentConfirmation', label: 'Payment confirmations', description: 'When your payment is processed' },
                { key: 'emailPrescriptionReady', label: 'Prescription ready', description: 'When a new prescription is issued' },
                { key: 'emailTelemedicineSession', label: 'Telemedicine sessions', description: 'Video consultation updates' }
            ]
        },
        {
            id: 'whatsapp',
            title: 'WhatsApp Notifications',
            icon: MessageSquare,
            description: 'Receive notifications via WhatsApp',
            masterKey: 'whatsappEnabled',
            options: [
                { key: 'whatsappAppointmentReminder', label: 'Appointment reminders', description: 'WhatsApp reminder before appointments' },
                { key: 'whatsappTelemedicineSession', label: 'Telemedicine sessions', description: 'WhatsApp when session is ready to join' },
                { key: 'whatsappPrescriptionReady', label: 'Prescription updates', description: 'WhatsApp when prescription is ready' }
            ]
        },
        {
            id: 'inApp',
            title: 'In-App Notifications',
            icon: Bell,
            description: 'Receive real-time notifications in the app',
            masterKey: 'inAppEnabled',
            options: []
        }
    ];

    if (!localPreferences) {
        return (
            <DashboardLayout title="Notification Settings" showBack={true}>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Notification Settings" showBack={true}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Notification Preferences
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage how you receive notifications
                            </p>
                        </div>
                        {hasChanges && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                Save Changes
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Unsaved changes warning */}
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3"
                    >
                        <AlertCircle className="text-amber-500" size={20} />
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
                        </p>
                    </motion.div>
                )}

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sectionIndex * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Section Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        localPreferences[section.masterKey] 
                                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                    }`}>
                                        <section.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={localPreferences[section.masterKey]}
                                    onChange={() => handleMasterToggle(section.id)}
                                />
                            </div>

                            {/* Options */}
                            {section.options.length > 0 && localPreferences[section.masterKey] && (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {section.options.map((option) => (
                                        <div
                                            key={option.key}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {option.label}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {option.description}
                                                </p>
                                            </div>
                                            <ToggleSwitch
                                                checked={localPreferences[option.key]}
                                                onChange={() => handleToggle(option.key)}
                                                small
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Disabled state message */}
                            {section.options.length > 0 && !localPreferences[section.masterKey] && (
                                <div className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                                    <p className="text-sm">Enable {section.title.toLowerCase()} to configure individual options</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Info card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        About Notifications
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Email notifications may take a few minutes to arrive</li>
                        <li>• WhatsApp notifications require a verified phone number</li>
                        <li>• In-app notifications appear instantly when connected</li>
                        <li>• Critical system notifications cannot be disabled</li>
                    </ul>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, small = false }) => {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                small ? 'h-5 w-9' : 'h-6 w-11'
            } ${
                checked 
                    ? 'bg-primary-600' 
                    : 'bg-gray-200 dark:bg-gray-600'
            }`}
        >
            <span
                className={`inline-block rounded-full bg-white shadow-sm transform transition-transform ${
                    small ? 'h-3.5 w-3.5' : 'h-4 w-4'
                } ${
                    checked 
                        ? small ? 'translate-x-[18px]' : 'translate-x-6' 
                        : 'translate-x-1'
                }`}
            />
        </button>
    );
};

export default NotificationSettingsPage;
