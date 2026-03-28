import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { Calendar, Plus, Clock, Copy, Save, AlertCircle, CopyCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Schedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday', 'Friday']);

    return (
        <DashboardLayout>
            <Header title="Schedule Configurations" subtitle="Manage availability and consultation slots" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                
                {/* Left Side: General Rules */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="surface-card !rounded-[var(--radius-3xl)] p-8">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4">Availability Rules</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] block mb-2">Slot Duration</label>
                                <select className="input-field">
                                    <option>15 Minutes</option>
                                    <option>20 Minutes</option>
                                    <option>30 Minutes</option>
                                    <option>45 Minutes</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] block mb-2">Buffer Between Appointments</label>
                                <select className="input-field">
                                    <option>No Buffer</option>
                                    <option>5 Minutes</option>
                                    <option>10 Minutes</option>
                                    <option>15 Minutes</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] block mb-2">Max Bookings Per Day</label>
                                <input type="number" defaultValue={20} className="input-field" />
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Modifying rules only affects future slots. Unbooked slots will be recalculated.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Weekly Grid Builder */}
                <div className="lg:col-span-2">
                    <div className="surface-card !rounded-[var(--radius-3xl)] overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-base)]">
                            <h3 className="font-bold text-[var(--text-primary)]">Weekly Slots</h3>
                            <button className="text-xs font-bold text-[var(--accent-teal)] border border-[var(--accent-teal)] px-3 py-1.5 rounded hover:bg-teal-50 transition-colors flex items-center gap-1">
                                <Copy className="w-3 h-3" /> Copy to all
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {days.map(day => {
                                const isActive = selectedDays.includes(day);
                                return (
                                    <div key={day} className={`p-6 !rounded-[var(--radius-2xl)] border ${isActive ? 'border-[var(--accent-teal)]/30 bg-gradient-to-r from-[var(--color-primary-soft)] to-transparent' : 'border-[var(--border-color)] bg-[var(--bg-base)] opacity-60'} transition-all duration-300`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-[var(--accent-teal)] border-gray-300 rounded focus:ring-[var(--accent-teal)]" 
                                                    checked={isActive}
                                                    onChange={() => {
                                                        if (isActive) setSelectedDays(selectedDays.filter(d => d !== day));
                                                        else setSelectedDays([...selectedDays, day]);
                                                    }}
                                                />
                                                <span className={\ont-bold \\}>{day}</span>
                                            </label>
                                            
                                            {isActive && (
                                                <button className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Add Period
                                                </button>
                                            )}
                                        </div>

                                        {isActive && (
                                            <div className="space-y-3">
                                                {/* Single shift example */}
                                                <div className="flex items-center gap-3">
                                                    <input type="time" defaultValue="09:00" className="input-field !w-32" />
                                                    <span className="text-[var(--text-muted)] font-medium text-xs">to</span>
                                                    <input type="time" defaultValue="13:00" className="input-field !w-32" />
                                                    <select className="input-field flex-1">
                                                        <option>In-Person (Clinic)</option>
                                                        <option>Telemedicine Only</option>
                                                        <option>Both Supported</option>
                                                    </select>
                                                </div>
                                                
                                                {/* Afternoon shift example (only showing for wednesdays as mockup) */}
                                                {day === 'Wednesday' && (
                                                    <div className="flex items-center gap-3">
                                                        <input type="time" defaultValue="15:00" className="input-field !w-32" />
                                                        <span className="text-[var(--text-muted)] font-medium text-xs">to</span>
                                                        <input type="time" defaultValue="18:00" className="input-field !w-32" />
                                                        <select className="input-field flex-1">
                                                            <option>Telemedicine Only</option>
                                                            <option>In-Person (Clinic)</option>
                                                            <option>Both Supported</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {!isActive && (
                                            <div className="text-xs text-[var(--text-muted)] font-medium italic pl-7">
                                                Unavailable on {day}s
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="p-4 border-t border-[var(--border-color)] bg-slate-50 flex justify-end gap-3 rounded-b-[var(--radius-lg)]">
                            <button className="px-5 py-2 text-sm font-bold text-[var(--text-secondary)] border border-[var(--border-color)] bg-white shadow-sm rounded hover:bg-slate-50 transition-colors">
                                Discard Changes
                            </button>
                            <button className="px-5 py-2 text-sm font-bold text-white bg-[var(--accent-teal)] shadow-sm rounded hover:bg-teal-700 transition-colors flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Schedule Layout
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

