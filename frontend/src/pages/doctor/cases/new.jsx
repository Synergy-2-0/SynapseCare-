import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    FileText,
    Save,
    CheckCircle,
    Clock,
    User,
    Stethoscope,
    Pill,
    FlaskConical,
    FileSpreadsheet,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { caseApi, prescriptionApi, doctorApi } from '../../../lib/api';
import { isDoctorApproved } from '../../../lib/doctorVerification';

// Medical Components
import SOAPNotes from '../../../components/doctor/SOAPNotes';
import PrescriptionForm from '../../../components/doctor/PrescriptionForm';
import LabOrderForm from '../../../components/doctor/LabOrderForm';
import DiagnosisCodeSearch from '../../../components/doctor/DiagnosisCodeSearch';

const NewConsultationPage = () => {
    const router = useRouter();
    const { patientId, appointmentId, patientName, patientAge, patientGender } = router.query;

    const [caseId, setCaseId] = useState(null);

    // Consultation State
    const [consultationData, setConsultationData] = useState({
        patientInfo: {
            id: patientId || '',
            name: patientName || 'Patient',
            age: patientAge ? parseInt(patientAge) : null,
            gender: patientGender || ''
        },
        chiefComplaint: '',
        soapNotes: {},
        prescriptions: [],
        labOrders: [],
        diagnoses: [],
        status: 'DRAFT'
    });

    const [activeTab, setActiveTab] = useState('soap');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [error, setError] = useState(null);

    // Create case on mount if appointmentId exists
    useEffect(() => {
        if (appointmentId && !caseId) {
            createInitialCase();
        }
    }, [appointmentId]);

    useEffect(() => {
        let mounted = true;

        const validateAccess = async () => {
            try {
                const res = await doctorApi.get('/profile/me');
                if (mounted && !isDoctorApproved(res?.data?.verificationStatus)) {
                    router.replace('/doctor/setup');
                }
            } catch {
                if (mounted) {
                    router.replace('/doctor/setup');
                }
            }
        };

        validateAccess();
        return () => {
            mounted = false;
        };
    }, [router]);

    const createInitialCase = async () => {
        try {
            const response = await caseApi.post('', {
                appointmentId: parseInt(appointmentId),
                patientId: patientId ? parseInt(patientId) : null,
                patientName: patientName || 'Patient',
                patientAge: patientAge ? parseInt(patientAge) : null,
                patientGender: patientGender || null,
                chiefComplaint: ''
            });
            setCaseId(response.data.data.id);
        } catch (err) {
            console.error('Failed to create case:', err);
            setError('Failed to create consultation case');
        }
    };

    // Tab Configuration
    const tabs = [
        {
            id: 'soap',
            label: 'SOAP Notes',
            icon: FileText,
            color: 'text-teal-600',
            description: 'Clinical documentation'
        },
        {
            id: 'prescriptions',
            label: 'Prescriptions',
            icon: Pill,
            color: 'text-emerald-600',
            description: 'Digital prescriptions'
        },
        {
            id: 'lab-orders',
            label: 'Lab Orders',
            icon: FlaskConical,
            color: 'text-amber-600',
            description: 'Laboratory tests'
        },
        {
            id: 'diagnosis',
            label: 'Diagnosis',
            icon: FileSpreadsheet,
            color: 'text-rose-600',
            description: 'ICD-10 codes'
        }
    ];

    // Handle data changes
    const handleDataChange = (section, data) => {
        setConsultationData(prev => ({
            ...prev,
            [section]: data,
            updatedAt: new Date().toISOString()
        }));
        setHasUnsavedChanges(true);
    };

    // Save consultation
    const handleSave = async (finalize = false) => {
        setIsSaving(true);
        setError(null);

        try {
            // Prepare update data
            const updateData = {
                chiefComplaint: consultationData.chiefComplaint,
                soapNotesJson: JSON.stringify(consultationData.soapNotes),
                diagnosesJson: JSON.stringify(consultationData.diagnoses),
                labOrdersJson: JSON.stringify(consultationData.labOrders),
                status: finalize ? 'COMPLETED' : 'IN_PROGRESS'
            };

            // Update case
            if (caseId) {
                await caseApi.put(`/${caseId}`, updateData);
            }

            // Create prescriptions if any
            if (finalize && consultationData.prescriptions.length > 0) {
                const doctorId = localStorage.getItem('user_id');
                const doctorName = localStorage.getItem('user_name');

                for (const prescription of consultationData.prescriptions) {
                    await prescriptionApi.post('/create', {
                        appointmentId: parseInt(appointmentId),
                        doctorId: parseInt(doctorId),
                        patientId: patientId ? parseInt(patientId) : null,
                        doctorName: doctorName,
                        patientName: consultationData.patientInfo.name,
                        patientAge: consultationData.patientInfo.age,
                        patientGender: consultationData.patientInfo.gender,
                        medicineName: prescription.medication,
                        dosage: prescription.dosage,
                        duration: prescription.duration,
                        instructions: prescription.instructions,
                        diagnosis: consultationData.diagnoses[0]?.description || '',
                        diagnosisCode: consultationData.diagnoses[0]?.code || ''
                    });
                }
            }

            // Finalize case if needed
            if (finalize && caseId) {
                await caseApi.post(`/${caseId}/finalize`);
            }

            setHasUnsavedChanges(false);

            if (finalize) {
                router.push('/doctor/dashboard');
            }
        } catch (err) {
            console.error('Failed to save consultation:', err);
            setError('Failed to save consultation. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate completion status
    const completionStatus = {
        soap: Object.keys(consultationData.soapNotes).length > 0,
        prescriptions: consultationData.prescriptions.length > 0,
        labOrders: consultationData.labOrders.length > 0,
        diagnoses: consultationData.diagnoses.length > 0
    };

    const totalSections = Object.keys(completionStatus).length;
    const completedSections = Object.values(completionStatus).filter(Boolean).length;
    const completionPercentage = Math.round((completedSections / totalSections) * 100);

    // Validate if consultation can be finalized
    const canFinalize = completionStatus.soap && completionStatus.diagnoses;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                New Consultation
                            </h1>
                            <p className="text-slate-600">
                                Patient: {consultationData.patientInfo.name} • {consultationData.patientInfo.age}y {consultationData.patientInfo.gender}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Completion Status */}
                        <div className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2 bg-slate-100 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            {completedSections}/{totalSections} Complete ({completionPercentage}%)
                        </div>

                        {/* Save Buttons */}
                        <Button
                            variant="outline"
                            onClick={() => handleSave(false)}
                            loading={isSaving}
                            disabled={!hasUnsavedChanges}
                        >
                            <Save className="w-4 h-4" />
                            Save Draft
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() => handleSave(true)}
                            loading={isSaving}
                            disabled={!canFinalize}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Finalize Consultation
                        </Button>
                    </div>
                </div>

                {/* Patient Info Card */}
                <Card padding="md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                                {consultationData.patientInfo.name}
                            </h3>
                            <div className="text-sm text-slate-600 flex gap-4">
                                <span>Age: {consultationData.patientInfo.age}</span>
                                <span>Gender: {consultationData.patientInfo.gender}</span>
                                <span>Phone: {consultationData.patientInfo.phone}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500">Consultation Date</div>
                            <div className="font-medium text-slate-900">
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Navigation Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                                {tab.label}
                                {completionStatus[tab.id] && (
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'soap' && (
                        <Card padding="lg">
                            <SOAPNotes
                                initialData={consultationData.soapNotes}
                                onChange={(data) => handleDataChange('soapNotes', data)}
                            />
                        </Card>
                    )}

                    {activeTab === 'prescriptions' && (
                        <Card padding="lg">
                            <PrescriptionForm
                                prescriptions={consultationData.prescriptions}
                                onChange={(data) => handleDataChange('prescriptions', data)}
                            />
                        </Card>
                    )}

                    {activeTab === 'lab-orders' && (
                        <Card padding="lg">
                            <LabOrderForm
                                labOrders={consultationData.labOrders}
                                onChange={(data) => handleDataChange('labOrders', data)}
                            />
                        </Card>
                    )}

                    {activeTab === 'diagnosis' && (
                        <Card padding="lg">
                            <DiagnosisCodeSearch
                                selectedDiagnoses={consultationData.diagnoses}
                                onChange={(data) => handleDataChange('diagnoses', data)}
                            />
                        </Card>
                    )}
                </motion.div>

                {/* Summary Panel */}
                {completedSections > 0 && (
                    <Card padding="md" className="bg-slate-50 border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            Consultation Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-teal-600" />
                                <span className={completionStatus.soap ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                                    SOAP Notes {completionStatus.soap ? '✓' : '○'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Pill className="w-4 h-4 text-emerald-600" />
                                <span className={completionStatus.prescriptions ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                                    {consultationData.prescriptions.length} Prescriptions
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FlaskConical className="w-4 h-4 text-amber-600" />
                                <span className={completionStatus.labOrders ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                                    {consultationData.labOrders.length} Lab Orders
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                                <span className={completionStatus.diagnoses ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                                    {consultationData.diagnoses.length} Diagnoses
                                </span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Validation Alert */}
                {!canFinalize && completedSections > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 text-sm mb-1">
                                    Complete Required Sections
                                </h4>
                                <p className="text-xs text-amber-700">
                                    To finalize this consultation, please complete the SOAP Notes and add at least one diagnosis code.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NewConsultationPage;