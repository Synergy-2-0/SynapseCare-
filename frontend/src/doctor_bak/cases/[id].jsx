import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    ArrowLeft,
    Download,
    RefreshCcw
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import SOAPNotes from '../../../components/doctor/SOAPNotes';
import PrescriptionForm from '../../../components/doctor/PrescriptionForm';
import LabOrderForm from '../../../components/doctor/LabOrderForm';
import DiagnosisCodeSearch from '../../../components/doctor/DiagnosisCodeSearch';
import { caseApi, prescriptionApi } from '../../../lib/api';
import { DOCTOR_ROUTES } from '../../../constants/routes';

const safeParse = (value, fallback) => {
    if (!value) {
        return fallback;
    }

    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
};

const mapCaseToViewModel = (caseData, prescriptions) => ({
    id: caseData.id,
    appointmentId: caseData.appointmentId,
    patientInfo: {
        id: caseData.patientId,
        name: caseData.patientName || `Patient #${caseData.patientId}`,
        age: caseData.patientAge,
        gender: caseData.patientGender
    },
    chiefComplaint: caseData.chiefComplaint || '',
    soapNotes: safeParse(caseData.soapNotesJson, {}),
    diagnoses: safeParse(caseData.diagnosesJson, []),
    labOrders: safeParse(caseData.labOrdersJson, []),
    prescriptions: Array.isArray(prescriptions)
        ? prescriptions.map((item) => ({
            id: item.id,
            medication: item.medicineName || '',
            genericName: item.medicineName || '',
            dosage: item.dosage || '',
            frequency: item.frequency || '',
            duration: item.duration || '',
            instructions: item.instructions || '',
            warnings: ''
        }))
        : [],
    notes: caseData.notes || '',
    status: caseData.status || 'DRAFT',
    createdAt: caseData.createdAt,
    updatedAt: caseData.updatedAt,
    finalizedAt: caseData.finalizedAt
});

const getBadgeVariant = (status) => {
    if (status === 'COMPLETED') {
        return 'success';
    }

    if (status === 'IN_PROGRESS') {
        return 'info';
    }

    return 'warning';
};

const ConsultationViewPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [consultationData, setConsultationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('soap');
    const [isSaving, setIsSaving] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const isCompleted = consultationData?.status === 'COMPLETED';

    const backPath = useMemo(() => {
        if (consultationData?.patientInfo?.id) {
            return DOCTOR_ROUTES.PATIENT_DETAIL(consultationData.patientInfo.id);
        }

        return DOCTOR_ROUTES.PATIENTS;
    }, [consultationData]);

    const loadConsultation = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            const caseResponse = await caseApi.get(`/${id}`);
            const casePayload = caseResponse?.data?.data ?? caseResponse?.data;

            if (!casePayload?.id) {
                setConsultationData(null);
                setError('Consultation case not found.');
                return;
            }

            let prescriptions = [];
            if (casePayload.appointmentId) {
                try {
                    const prescriptionResponse = await prescriptionApi.get(`/appointment/${casePayload.appointmentId}`);
                    const prescriptionPayload = prescriptionResponse?.data?.data ?? prescriptionResponse?.data;
                    prescriptions = Array.isArray(prescriptionPayload) ? prescriptionPayload : [];
                } catch (prescriptionError) {
                    console.warn('Unable to load prescriptions for case:', prescriptionError);
                }
            }

            setConsultationData(mapCaseToViewModel(casePayload, prescriptions));
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Error loading consultation:', err);
            setError('Failed to load consultation details.');
            setConsultationData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadConsultation();
    }, [loadConsultation]);

    const handleDataChange = (section, data) => {
        setConsultationData((prev) => ({
            ...prev,
            [section]: data,
            updatedAt: new Date().toISOString()
        }));
        setHasUnsavedChanges(true);
    };

    const buildCaseUpdatePayload = (status) => ({
        chiefComplaint: consultationData?.chiefComplaint || '',
        soapNotesJson: JSON.stringify(consultationData?.soapNotes || {}),
        diagnosesJson: JSON.stringify(consultationData?.diagnoses || []),
        labOrdersJson: JSON.stringify(consultationData?.labOrders || []),
        notes: consultationData?.notes || '',
        status
    });

    const persistNewPrescriptions = async () => {
        const appointmentId = consultationData?.appointmentId;
        const doctorId = localStorage.getItem('user_id');
        const doctorName = localStorage.getItem('user_name') || `Doctor #${doctorId}`;
        const patientId = consultationData?.patientInfo?.id;

        if (!appointmentId || !doctorId || !patientId) {
            return;
        }

        const newPrescriptions = (consultationData?.prescriptions || []).filter((item) => !item.id);

        for (const prescription of newPrescriptions) {
            await prescriptionApi.post('/create', {
                appointmentId: Number(appointmentId),
                doctorId: Number(doctorId),
                patientId: Number(patientId),
                doctorName,
                patientName: consultationData.patientInfo.name,
                patientAge: consultationData.patientInfo.age,
                patientGender: consultationData.patientInfo.gender,
                medicineName: prescription.medication || prescription.genericName,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                duration: prescription.duration,
                instructions: prescription.instructions,
                diagnosis: consultationData.diagnoses?.[0]?.name || '',
                diagnosisCode: consultationData.diagnoses?.[0]?.code || ''
            });
        }
    };

    const handleSave = async () => {
        if (!consultationData?.id) {
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            await caseApi.put(`/${consultationData.id}`, buildCaseUpdatePayload('IN_PROGRESS'));
            setHasUnsavedChanges(false);
            await loadConsultation();
        } catch (saveError) {
            console.error('Failed to save consultation:', saveError);
            setError(saveError.response?.data?.message || 'Failed to save consultation changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalize = async () => {
        if (!consultationData?.id) {
            return;
        }

        if (!consultationData?.soapNotes?.subjective || (consultationData?.diagnoses || []).length === 0) {
            setError('Add SOAP subjective notes and at least one diagnosis before finalizing.');
            return;
        }

        try {
            setIsFinalizing(true);
            setError('');

            await caseApi.put(`/${consultationData.id}`, buildCaseUpdatePayload('IN_PROGRESS'));
            await persistNewPrescriptions();
            await caseApi.post(`/${consultationData.id}/finalize`);

            setHasUnsavedChanges(false);
            await loadConsultation();
        } catch (finalizeError) {
            console.error('Failed to finalize consultation:', finalizeError);
            setError(finalizeError.response?.data?.message || 'Failed to finalize consultation.');
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleDownloadLatestPrescription = async () => {
        const latest = consultationData?.prescriptions?.find((item) => item.id);

        if (!latest?.id) {
            setError('No generated prescription PDF is available yet.');
            return;
        }

        try {
            const response = await prescriptionApi.get(`/${latest.id}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `consultation-${consultationData.id}-prescription-${latest.id}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (downloadError) {
            console.error('Failed to download prescription PDF:', downloadError);
            setError('Unable to download prescription PDF.');
        }
    };

    const tabs = [
        {
            id: 'soap',
            label: 'SOAP Notes',
            icon: FileText,
            color: 'text-blue-600'
        },
        {
            id: 'prescriptions',
            label: 'Prescriptions',
            icon: Pill,
            color: 'text-emerald-600'
        },
        {
            id: 'lab-orders',
            label: 'Lab Orders',
            icon: FlaskConical,
            color: 'text-amber-600'
        },
        {
            id: 'diagnosis',
            label: 'Diagnosis',
            icon: FileSpreadsheet,
            color: 'text-rose-600'
        }
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingSpinner size="fullscreen" message="Loading consultation..." />
            </DashboardLayout>
        );
    }

    if (!consultationData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Card padding="lg" className="text-center max-w-lg w-full">
                        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {error || 'Consultation Not Found'}
                        </h3>
                        <Button variant="outline" onClick={() => router.push(DOCTOR_ROUTES.PATIENTS)}>
                            Back to Patients
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Header
                title={`Consultation #${consultationData.id}`}
                subtitle={`Patient: ${consultationData.patientInfo.name}`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => router.push(backPath)}>
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <Button variant="outline" onClick={loadConsultation}>
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={handleDownloadLatestPrescription}>
                            <Download className="w-4 h-4" />
                            Download Rx
                        </Button>
                        {!isCompleted && (
                            <Button
                                variant="secondary"
                                onClick={handleSave}
                                loading={isSaving}
                                disabled={!hasUnsavedChanges}
                            >
                                <Save className="w-4 h-4" />
                                Save Draft
                            </Button>
                        )}
                        {!isCompleted && (
                            <Button variant="primary" onClick={handleFinalize} loading={isFinalizing}>
                                <CheckCircle className="w-4 h-4" />
                                Finalize
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="space-y-6">
                {error && (
                    <Card padding="md" className="border-l-4 border-l-rose-600 bg-rose-50">
                        <p className="text-sm text-rose-700">{error}</p>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card padding="md" className="lg:col-span-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    {consultationData.patientInfo.name}
                                </h3>
                                <div className="text-sm text-slate-600 flex flex-wrap gap-3">
                                    <span>ID: {consultationData.patientInfo.id}</span>
                                    {consultationData.patientInfo.age ? <span>Age: {consultationData.patientInfo.age}</span> : null}
                                    {consultationData.patientInfo.gender ? <span>Gender: {consultationData.patientInfo.gender}</span> : null}
                                    <span>Appointment: #{consultationData.appointmentId || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-600">Created:</span>
                                <span className="font-medium text-slate-900">
                                    {consultationData.createdAt ? new Date(consultationData.createdAt).toLocaleString() : '-'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                                <span className="text-slate-600">Status:</span>
                                <Badge variant={getBadgeVariant(consultationData.status)} size="sm">
                                    {consultationData.status || 'DRAFT'}
                                </Badge>
                            </div>
                            {consultationData.finalizedAt && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-slate-600">Finalized:</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(consultationData.finalizedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <Card padding="md">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Chief Complaint
                            </label>
                            <textarea
                                value={consultationData.chiefComplaint || ''}
                                onChange={(event) => handleDataChange('chiefComplaint', event.target.value)}
                                placeholder="Primary reason for this consultation"
                                className="w-full min-h-27.5 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                                disabled={isCompleted}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Clinical Notes
                            </label>
                            <textarea
                                value={consultationData.notes || ''}
                                onChange={(event) => handleDataChange('notes', event.target.value)}
                                placeholder="Additional clinical notes, follow-up remarks, and handover guidance"
                                className="w-full min-h-27.5 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                                disabled={isCompleted}
                            />
                        </div>
                    </div>
                </Card>

                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={
                                    `flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`
                                }
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                                {tab.label}
                                {tab.id === 'prescriptions' && consultationData.prescriptions.length > 0 && (
                                    <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                        {consultationData.prescriptions.length}
                                    </span>
                                )}
                                {tab.id === 'lab-orders' && consultationData.labOrders.length > 0 && (
                                    <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                        {consultationData.labOrders.length}
                                    </span>
                                )}
                                {tab.id === 'diagnosis' && consultationData.diagnoses.length > 0 && (
                                    <span className="ml-1 text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                                        {consultationData.diagnoses.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'soap' && (
                        <Card padding="lg" className={isCompleted ? 'pointer-events-none opacity-90' : ''}>
                            <SOAPNotes
                                initialData={consultationData.soapNotes}
                                onChange={(data) => handleDataChange('soapNotes', data)}
                            />
                        </Card>
                    )}

                    {activeTab === 'prescriptions' && (
                        <Card padding="lg" className={isCompleted ? 'pointer-events-none opacity-90' : ''}>
                            <PrescriptionForm
                                prescriptions={consultationData.prescriptions}
                                onChange={(data) => handleDataChange('prescriptions', data)}
                            />
                        </Card>
                    )}

                    {activeTab === 'lab-orders' && (
                        <Card padding="lg" className={isCompleted ? 'pointer-events-none opacity-90' : ''}>
                            <LabOrderForm
                                labOrders={consultationData.labOrders}
                                onChange={(data) => handleDataChange('labOrders', data)}
                            />
                        </Card>
                    )}

                    {activeTab === 'diagnosis' && (
                        <Card padding="lg" className={isCompleted ? 'pointer-events-none opacity-90' : ''}>
                            <DiagnosisCodeSearch
                                selectedDiagnoses={consultationData.diagnoses}
                                onChange={(data) => handleDataChange('diagnoses', data)}
                            />
                        </Card>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default ConsultationViewPage;