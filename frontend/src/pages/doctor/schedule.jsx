import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Save,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle,
    CalendarOff
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import useSchedule from '../../hooks/useSchedule';
import useToast from '../../hooks/useToast';

const DAY_LABELS = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
};

const ScheduleManagementPage = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const {
        availability,
        loading,
        saving,
        error,
        saveAllAvailability,
        addScheduleOverride,
        updateLocalAvailability,
        DAYS_OF_WEEK
    } = useSchedule();

    const [overrideForm, setOverrideForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        isAvailable: false,
        reason: ''
    });
    const [recentOverrides, setRecentOverrides] = useState([]);

    const handleTimeChange = (day, field, value) => {
        updateLocalAvailability(day, { [field]: value });
    };

    const handleToggleDay = (day) => {
        updateLocalAvailability(day, { isActive: !availability[day].isActive });
    };

    const handleSaveWeekly = async () => {
        const success = await saveAllAvailability(availability);
        if (success) {
            showToast?.('Weekly schedule saved successfully', 'success');
        } else {
            showToast?.('Failed to save schedule', 'error');
        }
    };

    const handleAddOverride = async () => {
        if (!overrideForm.date) {
            showToast?.('Please select a date', 'error');
            return;
        }

        const success = await addScheduleOverride(overrideForm);
        if (success) {
            setRecentOverrides(prev => [{
                ...overrideForm,
                id: Date.now()
            }, ...prev].slice(0, 5));
            setOverrideForm({
                date: '',
                startTime: '',
                endTime: '',
                isAvailable: false,
                reason: ''
            });
            showToast?.('Schedule override added', 'success');
        }
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading Schedule..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title="Manage Schedule"
                subtitle="Set your availability and schedule overrides"
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Weekly Availability */}
                <Card
                    title="Weekly Availability"
                    subtitle="Set your regular working hours"
                    actions={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveWeekly}
                            loading={saving}
                        >
                            <Save size={14} />
                            Save
                        </Button>
                    }
                    padding="none"
                >
                    <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
                        {DAYS_OF_WEEK.map((day) => (
                            <motion.div
                                key={day}
                                className={`
                                    flex items-center gap-4 p-3 rounded-xl border
                                    transition-all duration-200
                                    ${availability[day].isActive
                                        ? 'bg-white border-slate-200'
                                        : 'bg-slate-50 border-slate-100'
                                    }
                                `}
                                whileHover={{ scale: 1.01 }}
                            >
                                {/* Toggle */}
                                <button
                                    onClick={() => handleToggleDay(day)}
                                    className={`
                                        w-10 h-6 rounded-full p-1 transition-all duration-200
                                        ${availability[day].isActive
                                            ? 'bg-blue-600'
                                            : 'bg-slate-300'
                                        }
                                    `}
                                >
                                    <div
                                        className={`
                                            w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform
                                            ${availability[day].isActive ? 'translate-x-4' : 'translate-x-0'}
                                        `}
                                    />
                                </button>

                                {/* Day Label */}
                                <span className={`
                                    w-24 font-medium text-sm
                                    ${availability[day].isActive ? 'text-slate-900' : 'text-slate-400'}
                                `}>
                                    {DAY_LABELS[day]}
                                </span>

                                {/* Time Inputs */}
                                {availability[day].isActive && (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="time"
                                            value={availability[day].startTime}
                                            onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                                            className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                        />
                                        <span className="text-slate-400 text-sm">to</span>
                                        <input
                                            type="time"
                                            value={availability[day].endTime}
                                            onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                                            className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                )}

                                {!availability[day].isActive && (
                                    <span className="text-sm text-slate-400 flex-1">Day Off</span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Date Override */}
                <div className="space-y-5">
                    <Card
                        title="Add Schedule Override"
                        subtitle="Block specific dates or add special hours"
                        padding="md"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date</label>
                                    <input
                                        type="date"
                                        value={overrideForm.date}
                                        onChange={(e) => setOverrideForm(prev => ({ ...prev, date: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Status</label>
                                    <select
                                        value={overrideForm.isAvailable ? 'available' : 'blocked'}
                                        onChange={(e) => setOverrideForm(prev => ({
                                            ...prev,
                                            isAvailable: e.target.value === 'available'
                                        }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                    >
                                        <option value="blocked">Blocked (Leave/Off)</option>
                                        <option value="available">Available (Special Hours)</option>
                                    </select>
                                </div>
                            </div>

                            {overrideForm.isAvailable && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Start Time</label>
                                        <input
                                            type="time"
                                            value={overrideForm.startTime}
                                            onChange={(e) => setOverrideForm(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">End Time</label>
                                        <input
                                            type="time"
                                            value={overrideForm.endTime}
                                            onChange={(e) => setOverrideForm(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Reason (Optional)</label>
                                <input
                                    type="text"
                                    value={overrideForm.reason}
                                    onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="e.g., Medical Conference, Personal Leave"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            <Button
                                variant="primary"
                                size="md"
                                className="w-full"
                                onClick={handleAddOverride}
                                loading={saving}
                            >
                                <Plus size={16} />
                                Add Override
                            </Button>
                        </div>
                    </Card>

                    {/* Recent Overrides */}
                    {recentOverrides.length > 0 && (
                        <Card
                            title="Recent Overrides"
                            padding="md"
                        >
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {recentOverrides.map((override) => (
                                    <div
                                        key={override.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {override.isAvailable ? (
                                                <CheckCircle size={16} className="text-emerald-600" />
                                            ) : (
                                                <CalendarOff size={16} className="text-rose-600" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {new Date(override.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {override.reason && (
                                                    <p className="text-xs text-slate-500">{override.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={override.isAvailable ? 'success' : 'danger'}
                                            size="sm"
                                        >
                                            {override.isAvailable ? 'Available' : 'Blocked'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <AlertCircle size={16} className="text-rose-600" />
                    <p className="text-sm text-rose-700">{error}</p>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ScheduleManagementPage;
