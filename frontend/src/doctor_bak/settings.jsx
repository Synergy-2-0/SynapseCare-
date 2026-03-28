import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { User, Bell, Lock, Shield, Mail, Globe, Monitor, Smartphone } from 'lucide-react';

export default function Settings() {
    return (
        <DashboardLayout>
            <Header title="Profile & Settings" subtitle="Manage your account preferences and personal information" />
            
            <div className="flex flex-col md:flex-row gap-8 mt-8">
                {/* Side Nav for Settings */}
                <div className="md:w-64 space-y-1">
                    {[
                        { icon: User, label: 'Profile Information', active: true },
                        { icon: Bell, label: 'Notifications', active: false },
                        { icon: Lock, label: 'Security & Privacy', active: false },
                        { icon: Globe, label: 'Localization', active: false },
                        { icon: Monitor, label: 'Device Management', active: false },
                    ].map(tab => (
                        <button key={tab.label} className={\w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-[var(--radius-sm)] transition-colors \\}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Settings Area */}
                <div className="flex-1 space-y-6">
                    
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                            <h3 className="font-bold text-[var(--text-primary)]">Personal Details</h3>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Update your photo and personal details here.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                                    <User size={32} />
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-white border border-[var(--border-color)] text-sm font-bold rounded shadow-sm hover:text-[var(--accent-teal)] transition-colors mb-2 block">
                                        Upload New Photo
                                    </button>
                                    <p className="text-xs text-[var(--text-muted)]">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text-muted)]">First Name</label>
                                    <input type="text" defaultValue="John" className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded text-sm focus:border-[var(--accent-teal)] outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--text-muted)]">Last Name</label>
                                    <input type="text" defaultValue="Doe" className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded text-sm focus:border-[var(--accent-teal)] outline-none" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--text-muted)]">Email Address</label>
                                    <input type="email" defaultValue="dr.john@example.com" disabled className="w-full p-2 bg-slate-50 border border-[var(--border-color)] rounded text-sm outline-none text-[var(--text-muted)]" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--text-muted)]">Medical License Number</label>
                                    <input type="text" defaultValue="SLMC-981242" disabled className="w-full p-2 bg-slate-50 border border-[var(--border-color)] rounded text-sm outline-none text-[var(--text-muted)]" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--text-muted)]">Specialization</label>
                                    <select className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded text-sm focus:border-[var(--accent-teal)] outline-none">
                                        <option>General Practitioner</option>
                                        <option>Cardiologist</option>
                                        <option>Dermatologist</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border-color)] flex justify-end gap-3">
                            <button className="px-5 py-2 text-sm font-bold text-[var(--text-secondary)] border border-transparent rounded hover:bg-[var(--bg-hover)] transition-colors">
                                Cancel
                            </button>
                            <button className="px-5 py-2 text-sm font-bold text-white bg-[var(--accent-teal)] rounded shadow hover:bg-teal-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </DashboardLayout>
    );
}
