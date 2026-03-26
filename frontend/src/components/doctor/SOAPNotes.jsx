import React, { useState } from 'react';
import { FileText, User, Stethoscope, Brain, Clipboard } from 'lucide-react';

/**
 * SOAPNotes Component
 *
 * SOAP (Subjective, Objective, Assessment, Plan) Notes for clinical documentation
 * Professional medical record keeping with structured format
 */
const SOAPNotes = ({
    initialData = {},
    onChange,
    className = ''
}) => {
    const [soapData, setSoapData] = useState({
        subjective: initialData.subjective || '',
        objective: initialData.objective || '',
        assessment: initialData.assessment || '',
        plan: initialData.plan || '',
        ...initialData
    });

    const handleChange = (section, value) => {
        const newData = { ...soapData, [section]: value };
        setSoapData(newData);
        if (onChange) {
            onChange(newData);
        }
    };

    const soapSections = [
        {
            key: 'subjective',
            title: 'Subjective',
            icon: User,
            placeholder: 'Chief Complaint:\n\nHistory of Present Illness:\n\nReview of Systems:\n\nPast Medical History:\n\nMedications:\n\nAllergies:\n\nSocial History:',
            description: 'Patient\'s description of symptoms, history, and concerns',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            key: 'objective',
            title: 'Objective',
            icon: Stethoscope,
            placeholder: 'Vital Signs:\n- Temperature: \n- Blood Pressure: \n- Heart Rate: \n- Respiratory Rate: \n- Oxygen Saturation: \n\nPhysical Examination:\n- General Appearance:\n- HEENT:\n- Cardiovascular:\n- Respiratory:\n- Abdominal:\n- Neurological:\n- Extremities:\n\nDiagnostic Results:',
            description: 'Physical examination findings, vital signs, and test results',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200'
        },
        {
            key: 'assessment',
            title: 'Assessment',
            icon: Brain,
            placeholder: 'Primary Diagnosis:\n1. \n\nDifferential Diagnoses:\n1. \n2. \n3. \n\nClinical Impression:\n\nSeverity/Stability:',
            description: 'Medical assessment, diagnosis, and clinical impression',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200'
        },
        {
            key: 'plan',
            title: 'Plan',
            icon: Clipboard,
            placeholder: 'Treatment Plan:\n1. \n\nMedications:\n1. \n\nDiagnostic Tests:\n1. \n\nFollow-up:\n- \n\nPatient Education:\n- \n\nReturn Precautions:\n- ',
            description: 'Treatment plan, medications, follow-up instructions',
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200'
        }
    ];

    return (
        <div className={className}>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    SOAP Clinical Notes
                </h2>
                <p className="text-sm text-slate-600">
                    Structured clinical documentation following the SOAP format
                </p>
            </div>

            <div className="space-y-6">
                {soapSections.map((section, index) => (
                    <div
                        key={section.key}
                        className={`border-2 ${section.borderColor} rounded-lg ${section.bgColor} p-5`}
                    >
                        {/* Section Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 ${section.bgColor} border ${section.borderColor} rounded-lg`}>
                                <section.icon className={`w-5 h-5 ${section.color}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    {section.title}
                                    <span className={`text-sm font-medium px-2 py-0.5 ${section.bgColor} ${section.color} rounded`}>
                                        {index + 1}
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {section.description}
                                </p>
                            </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                            value={soapData[section.key]}
                            onChange={(e) => handleChange(section.key, e.target.value)}
                            placeholder={section.placeholder}
                            className="w-full h-40 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm font-mono leading-relaxed resize-none bg-white"
                            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace' }}
                        />

                        {/* Character Count */}
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-slate-500">
                                Use structured format for professional documentation
                            </span>
                            <span className="text-xs text-slate-500">
                                {soapData[section.key]?.length || 0} characters
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Documentation Guidelines */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Documentation Guidelines</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Subjective:</strong> Use patient's own words in quotes when possible</li>
                    <li>• <strong>Objective:</strong> Record measurable, observable findings only</li>
                    <li>• <strong>Assessment:</strong> List most likely diagnosis first, include ICD-10 codes</li>
                    <li>• <strong>Plan:</strong> Be specific with medication dosages and follow-up timing</li>
                </ul>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {soapSections.map(section => (
                    <div key={section.key} className="text-center p-3 bg-white border border-slate-200 rounded-lg">
                        <div className={`w-8 h-8 ${section.bgColor} ${section.color} rounded-lg mx-auto mb-1 flex items-center justify-center`}>
                            <section.icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            {section.title}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                            {soapData[section.key]?.length > 0 ? 'Complete' : 'Pending'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SOAPNotes;