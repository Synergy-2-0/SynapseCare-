import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    Calendar,
    Clock,
    ChevronRight,
    UserCircle,
    Activity
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import useAppointments from '../../hooks/useAppointments';
import { formatDate } from '../../lib/utils';

const PatientListPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('lastVisit');
    const [filter, setFilter] = useState('all');

    // Get user ID from localStorage
    const [userId, setUserId] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('user_id');
            setUserId(id);
        }
    }, []);

    const { appointments, loading, error } = useAppointments(userId);

    if (!mounted || loading) {
        if (!mounted) return null;
        return <LoadingSpinner size="fullscreen" message="Loading Patients..." />;
    }

    // Derive patients from appointments
    const patients = useMemo(() => {
        const patientMap = new Map();

        appointments.forEach(appt => {
            const patientId = appt.patientId;
            if (!patientMap.has(patientId)) {
                patientMap.set(patientId, {
                    id: patientId,
                    name: appt.patientName || `Patient #${patientId}`,
                    appointments: [],
                    lastVisit: null,
                    totalVisits: 0,
                    upcomingAppointments: 0
                });
            }

            const patient = patientMap.get(patientId);
            patient.appointments.push(appt);

            if (appt.status === 'COMPLETED') {
                patient.totalVisits++;
                const apptDate = new Date(appt.appointmentDate);
                if (!patient.lastVisit || apptDate > new Date(patient.lastVisit)) {
                    patient.lastVisit = appt.appointmentDate;
                }
            }

            if (['CONFIRMED', 'PAID', 'PENDING'].includes(appt.status)) {
                const apptDate = new Date(appt.appointmentDate);
                if (apptDate >= new Date()) {
                    patient.upcomingAppointments++;
                }
            }
        });

        return Array.from(patientMap.values());
    }, [appointments]);

    // Filter and sort patients
    const filteredPatients = useMemo(() => {
        let result = [...patients];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.id?.toString().includes(query)
            );
        }

        // Status filter
        if (filter === 'active') {
            result = result.filter(p => p.upcomingAppointments > 0);
        } else if (filter === 'past') {
            result = result.filter(p => p.upcomingAppointments === 0 && p.totalVisits > 0);
        }

        // Sort
        if (sortBy === 'lastVisit') {
            result.sort((a, b) => {
                if (!a.lastVisit) return 1;
                if (!b.lastVisit) return -1;
                return new Date(b.lastVisit) - new Date(a.lastVisit);
            });
        } else if (sortBy === 'name') {
            result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortBy === 'visits') {
            result.sort((a, b) => b.totalVisits - a.totalVisits);
        }

        return result;
    }, [patients, searchQuery, filter, sortBy]);

    // Stats
    const stats = useMemo(() => ({
        total: patients.length,
        active: patients.filter(p => p.upcomingAppointments > 0).length,
        newThisMonth: patients.filter(p => {
            const firstAppt = p.appointments[0];
            if (!firstAppt) return false;
            const apptDate = new Date(firstAppt.appointmentDate);
            const now = new Date();
            return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
        }).length
    }), [patients]);

    const handleViewPatient = (patient) => {
        router.push(`/doctor/patients/${patient.id}`);
    };

    if (loading) {
        return <LoadingSpinner size="fullscreen" message="Loading Patients..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title="My Patients"
                subtitle="View and manage your patient list"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <StatCard
                    label="Total Patients"
                    value={stats.total}
                    icon={Users}
                    color="text-blue-700"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    label="Active Patients"
                    value={stats.active}
                    icon={Activity}
                    color="text-emerald-700"
                    bgColor="bg-emerald-50"
                />
                <StatCard
                    label="New This Month"
                    value={stats.newThisMonth}
                    icon={Calendar}
                    color="text-teal-700"
                    bgColor="bg-teal-50"
                />
            </div>

            {/* Search and Filters */}
            <Card padding="md" className="mb-5">
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px] relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or ID..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                    >
                        <option value="all">All Patients</option>
                        <option value="active">Active (Upcoming Appointments)</option>
                        <option value="past">Past Patients</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                    >
                        <option value="lastVisit">Sort by Last Visit</option>
                        <option value="name">Sort by Name</option>
                        <option value="visits">Sort by Total Visits</option>
                    </select>
                </div>
            </Card>

            {/* Patient List */}
            <Card padding="none">
                {filteredPatients.length === 0 ? (
                    <EmptyState
                        image="/images/patient-group.svg"
                        title="No patients found"
                        description={searchQuery
                            ? "Try a different search term"
                            : "Patients will appear here after they book appointments"
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Patient</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Last Visit</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Total Visits</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                                {filteredPatients.map((patient, index) => (
                                    <motion.tr
                                        key={patient.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => handleViewPatient(patient)}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                                                    {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{patient.name}</p>
                                                    <p className="text-xs text-slate-500">ID: {patient.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="text-slate-600">
                                                    {patient.lastVisit
                                                        ? formatDate(patient.lastVisit)
                                                        : 'No visits yet'
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="text-lg font-semibold text-slate-900">
                                                {patient.totalVisits}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {patient.upcomingAppointments > 0 ? (
                                                <Badge variant="success" size="sm">
                                                    {patient.upcomingAppointments} Upcoming
                                                </Badge>
                                            ) : (
                                                <Badge variant="neutral" size="sm">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewPatient(patient);
                                                }}
                                            >
                                                View
                                                <ChevronRight size={14} />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
};

export default PatientListPage;
