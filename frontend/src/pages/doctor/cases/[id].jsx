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
    ArrowLeft,
    Edit3,
    Eye,
    Download,
    Share
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Medical Components
import SOAPNotes from '../../../components/doctor/SOAPNotes';
import PrescriptionForm from '../../../components/doctor/PrescriptionForm';
import LabOrderForm from '../../../components/doctor/LabOrderForm';
import DiagnosisCodeSearch from '../../../components/doctor/DiagnosisCodeSearch';

const ConsultationViewPage = () => {
    const router = useRouter();
    const { id } = router.query;

    // State
    const [consultationData, setConsultationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('soap');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load consultation data
    useEffect(() => {
        if (id) {
            loadConsultation();
        }
    }, [id]);

    const loadConsultation = async () => {
        try {
            setLoading(true);

            // Mock data - replace with actual API call
            const mockData = {
                id: id,
                patientInfo: {
                    id: 'patient-123',
                    name: 'Sarah Johnson',
                    age: 34,
                    gender: 'Female',
                    phone: '+1-555-0123',
                    email: 'sarah.johnson@email.com',
                    medicalRecordNumber: 'MRN-789456'
                },
                soapNotes: {
                    subjective: `Chief Complaint: Persistent headaches for the past week\n\nHistory of Present Illness:\nPatient reports severe headaches starting 7 days ago. Describes as throbbing, primarily frontal, rated 7/10 in severity. Worse in the morning, improves slightly with ibuprofen. Associated with mild nausea but no vomiting.\n\nReview of Systems:\n- No vision changes\n- No neck stiffness\n- No fever\n- Mild photophobia\n\nPast Medical History:\n- Hypertension (controlled)\n- No history of migraines\n\nMedications:\n- Lisinopril 10mg daily\n- Multivitamin\n\nAllergies:\n- Penicillin (rash)\n\nSocial History:\n- Non-smoker\n- Occasional alcohol use\n- Works as accountant (high stress)`,
                    objective: `Vital Signs:\n- Temperature: 98.6°F (37°C)\n- Blood Pressure: 138/84 mmHg\n- Heart Rate: 72 bpm\n- Respiratory Rate: 16/min\n- Oxygen Saturation: 98% on room air\n\nPhysical Examination:\n- General Appearance: Well-appearing, no acute distress\n- HEENT: Normocephalic, pupils equal and reactive, no papilledema on fundoscopy\n- Cardiovascular: Regular rate and rhythm, no murmurs\n- Neurological: Alert and oriented x3, cranial nerves II-XII intact, no focal deficits\n- Neck: Supple, no nuchal rigidity\n\nDiagnostic Results:\nNone performed today`,
                    assessment: `Primary Diagnosis:\n1. Tension-type headache, likely stress-related\n\nDifferential Diagnoses:\n1. Medication overuse headache\n2. Hypertensive headache\n3. Cluster headache (less likely given pattern)\n\nClinical Impression:\nPatient presents with subacute onset headaches consistent with tension-type headaches, likely exacerbated by work stress. Blood pressure slightly elevated but not at concerning levels.\n\nSeverity/Stability:\nStable, outpatient management appropriate`,
                    plan: `Treatment Plan:\n1. Stress management counseling\n2. Regular sleep schedule\n3. Headache diary\n\nMedications:\n1. Ibuprofen 400mg TID PRN for headache\n2. Continue current Lisinopril\n\nDiagnostic Tests:\n1. Consider brain MRI if symptoms persist or worsen\n\nFollow-up:\n- Return in 2 weeks if no improvement\n- Sooner if headaches worsen or new symptoms develop\n\nPatient Education:\n- Stress reduction techniques\n- Proper hydration\n- Regular exercise\n\nReturn Precautions:\n- Severe sudden headache\n- Vision changes\n- Neck stiffness\n- Fever`
                },
                prescriptions: [
                    {
                        id: 1,
                        medication: 'Ibuprofen',
                        genericName: 'Ibuprofen',
                        dosage: '400mg',
                        frequency: 'Three times daily (TDS)',
                        duration: '14 days',
                        instructions: 'Take with food to prevent stomach upset',
                        warnings: 'Do not exceed 1200mg per day. Discontinue if stomach pain or black stools develop.'
                    }
                ],
                labOrders: [],
                diagnoses: [
                    {
                        id: 1,
                        code: 'G44.209',
                        name: 'Tension-type headache, unspecified, not intractable',
                        category: 'Neurological',
                        isPrimary: true,
                        notes: 'Likely stress-related, recent onset'
                    }
                ],
                status: 'completed',
                createdAt: '2026-03-25T10:30:00Z',
                updatedAt: '2026-03-25T11:45:00Z',
                finalizedAt: '2026-03-25T11:45:00Z',
                doctorInfo: {
                    name: 'Dr. Michael Chen',
                    specialty: 'Internal Medicine'
                }
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            setConsultationData(mockData);
        } catch (err) {
            setError('Failed to load consultation');
            console.error('Error loading consultation:', err);
        } finally {
            setLoading(false);
        }
    };

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
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Here you would make API call to save the consultation
            console.log('Saving consultation:', consultationData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to save consultation:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Tab Configuration
    const tabs = [
        {
            id: 'soap',
            label: 'SOAP Notes',
            icon: FileText,
            color: 'text-blue-600',
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

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingSpinner size="fullscreen" message="Loading consultation..." />
            </DashboardLayout>
        );
    }

    if (error || !consultationData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Card padding="lg" className="text-center">
                        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {error || 'Consultation Not Found'}
                        </h3>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/doctor/consultations')}
                        >
                            Back to Consultations
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/doctor/consultations')}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                Consultation #{consultationData.id}
                                <Badge
                                    variant={consultationData.status === 'completed' ? 'success' : 'warning'}
                                    size="md"
                                >
                                    {consultationData.status === 'completed' ? 'Completed' : 'Draft'}
                                </Badge>
                            </h1>
                            <p className="text-slate-600">
                                Patient: {consultationData.patientInfo.name} •
                                {new Date(consultationData.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Mode Toggle */}
                        <div className="flex items-center border border-slate-200 rounded-lg">
                            <button
                                onClick={() => setEditMode(false)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                    !editMode
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                <Eye className="w-4 h-4" />
                                View
                            </button>
                            <button
                                onClick={() => setEditMode(true)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                    editMode
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>

                        <Button variant="outline" size="sm">
                            <Share className="w-4 h-4" />
                            Share
                        </Button>

                        {/* Save Button (only show in edit mode) */}
                        {editMode && (
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                loading={isSaving}
                                disabled={!hasUnsavedChanges}
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </Button>
                        )}
                    </div>
                </div>

                {/* Patient & Consultation Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Info */}
                    <Card padding="md" className="lg:col-span-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    {consultationData.patientInfo.name}
                                </h3>
                                <div className="text-sm text-slate-600 flex gap-4">
                                    <span>Age: {consultationData.patientInfo.age}</span>
                                    <span>Gender: {consultationData.patientInfo.gender}</span>
                                    <span>MRN: {consultationData.patientInfo.medicalRecordNumber}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Consultation Meta */}
                    <Card padding="md">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-600">Created:</span>
                                <span className="font-medium text-slate-900">
                                    {new Date(consultationData.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {consultationData.finalizedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-slate-600">Completed:</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(consultationData.finalizedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                                <span className="text-slate-600">Doctor:</span>
                                <span className="font-medium text-slate-900">
                                    {consultationData.doctorInfo.name}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

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
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                                {tab.label}
                                {/* Show data indicators */}
                                {tab.id === 'prescriptions' && consultationData.prescriptions.length > 0 && (
                                    <span className="ml-1 text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">
                                        {consultationData.prescriptions.length}
                                    </span>
                                )}
                                {tab.id === 'lab-orders' && consultationData.labOrders.length > 0 && (
                                    <span className="ml-1 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
                                        {consultationData.labOrders.length}
                                    </span>
                                )}
                                {tab.id === 'diagnosis' && consultationData.diagnoses.length > 0 && (
                                    <span className="ml-1 text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                                        {consultationData.diagnoses.length}
                                    </span>
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
                                onChange={editMode ? (data) => handleDataChange('soapNotes', data) : undefined}
                                readOnly={!editMode}
                            />
                        </Card>
                    )}

                    {activeTab === 'prescriptions' && (
                        <Card padding="lg">
                            <PrescriptionForm
                                prescriptions={consultationData.prescriptions}
                                onChange={editMode ? (data) => handleDataChange('prescriptions', data) : undefined}
                                readOnly={!editMode}
                            />
                        </Card>
                    )}

                    {activeTab === 'lab-orders' && (
                        <Card padding="lg">
                            <LabOrderForm
                                labOrders={consultationData.labOrders}
                                onChange={editMode ? (data) => handleDataChange('labOrders', data) : undefined}
                                readOnly={!editMode}
                            />
                        </Card>
                    )}

                    {activeTab === 'diagnosis' && (
                        <Card padding="lg">
                            <DiagnosisCodeSearch
                                selectedDiagnoses={consultationData.diagnoses}
                                onChange={editMode ? (data) => handleDataChange('diagnoses', data) : undefined}
                                readOnly={!editMode}
                            />
                        </Card>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default ConsultationViewPage;