import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
    Brain,
    Stethoscope,
    MapPin,
    History,
    Search,
    Shield,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import UrgencyBadge from '../../components/patient/UrgencyBadge';
import DoctorRecommendationCard from '../../components/patient/DoctorRecommendationCard';

// Enhanced Symptom Checker Components
import CollapsibleSection from '../../components/symptom-checker/CollapsibleSection';
import SymptomChips from '../../components/symptom-checker/SymptomChips';
import SeveritySlider from '../../components/symptom-checker/SeveritySlider';
import DurationSelect from '../../components/symptom-checker/DurationSelect';
import RedFlagBanner from '../../components/symptom-checker/RedFlagBanner';
import BodyLocationSelector from '../../components/symptom-checker/BodyLocationSelector';
import MedicalHistoryForm from '../../components/symptom-checker/MedicalHistoryForm';

// Hooks and Utils
import useSymptomChecker from '../../hooks/useSymptomChecker';
import { detectRedFlags, getUrgencyLevel } from '../../lib/redFlagDetection';

const SymptomCheckerPage = () => {
    const router = useRouter();
    const { result, doctors, loading, error, checkSymptoms, reset } = useSymptomChecker();

    // Form state
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [additionalSymptoms, setAdditionalSymptoms] = useState('');
    const [severity, setSeverity] = useState(5);
    const [duration, setDuration] = useState('');
    const [onset, setOnset] = useState('');
    const [bodyRegions, setBodyRegions] = useState([]);
    const [medicalConditions, setMedicalConditions] = useState([]);
    const [medications, setMedications] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [formError, setFormError] = useState('');

    // UI state
    const [symptomsOpen, setSymptomsOpen] = useState(true);
    const [durationOpen, setDurationOpen] = useState(true);
    const [locationOpen, setLocationOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const redFlag = useMemo(() => {
        const allSymptoms = [...selectedSymptoms, additionalSymptoms];
        return detectRedFlags(allSymptoms, additionalSymptoms, severity);
    }, [selectedSymptoms, additionalSymptoms, severity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validate required fields
        if (selectedSymptoms.length === 0 && !additionalSymptoms.trim()) {
            setFormError('Please select or describe your symptoms before analysis.');
            return;
        }
        if (!duration || !onset) {
            setFormError('Please specify symptom duration and onset.');
            return;
        }

        // Format for AI analysis
        const symptomDescription = `
Patient Information:
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}

Symptoms:
- Selected symptoms: ${selectedSymptoms.join(', ') || 'None'}
- Additional details: ${additionalSymptoms || 'None'}
- Severity: ${severity}/10 (${severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'})
- Duration: ${duration}
- Onset: ${onset}

Body Locations:
${bodyRegions.length > 0 ? bodyRegions.join(', ') : 'Not specified'}

Medical History:
- Conditions: ${medicalConditions.join(', ') || 'None reported'}
- Current medications: ${medications.join(', ') || 'None'}
- Known allergies: ${allergies.join(', ') || 'None'}

Please provide a detailed medical analysis with possible conditions and recommended specialists.
        `.trim();

        await checkSymptoms(symptomDescription, age, gender);
    };

    const handleNewSession = () => {
        reset();
        // Reset all form state
        setSelectedSymptoms([]);
        setAdditionalSymptoms('');
        setSeverity(5);
        setDuration('');
        setOnset('');
        setBodyRegions([]);
        setMedicalConditions([]);
        setMedications([]);
        setAllergies([]);
        setAge('');
        setGender('');
        setFormError('');
    };

    const handleBookAppointment = (doctor) => {
        router.push(`/patient/book-appointment?doctorId=${doctor.id}`);
    };

    const handleCallEmergency = () => {
        window.open('tel:119', '_self');
    };

    const handleFindEmergency = () => {
        // Open maps or emergency center finder
        window.open('https://maps.google.com/?q=emergency+hospital+near+me', '_blank');
    };

    const isFormValid = () => {
        return (selectedSymptoms.length > 0 || additionalSymptoms.trim()) &&
               duration && onset;
    };

    const urgencyLevel = getUrgencyLevel(redFlag, severity);

    return (
        <DashboardLayout>
            <Header
                title="AI Symptom Checker"
                subtitle="Professional medical symptom analysis powered by AI"
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Symptom Checker Form */}
                <div className="xl:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Red Flag Warning */}
                        {redFlag && (
                            <RedFlagBanner
                                warning={redFlag.warning}
                                severity={redFlag.severity}
                                onCallEmergency={handleCallEmergency}
                                onFindEmergency={handleFindEmergency}
                            />
                        )}

                        {/* Symptoms Section - Required */}
                        <CollapsibleSection
                            title="Symptoms"
                            isRequired={true}
                            isOpen={symptomsOpen}
                            onToggle={() => setSymptomsOpen(!symptomsOpen)}
                            icon={Stethoscope}
                            badge="Required"
                        >
                            <SymptomChips
                                selectedSymptoms={selectedSymptoms}
                                onSymptomToggle={setSelectedSymptoms}
                                additionalSymptoms={additionalSymptoms}
                                onAdditionalSymptomsChange={setAdditionalSymptoms}
                            />
                        </CollapsibleSection>

                        {formError && (
                            <Card padding="md" className="border-l-4 border-l-rose-600 bg-rose-50">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-rose-800 mb-1">Missing Required Inputs</h4>
                                        <p className="text-sm text-rose-700">{formError}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Duration & Severity Section - Required */}
                        <CollapsibleSection
                            title="Duration & Severity"
                            isRequired={true}
                            isOpen={durationOpen}
                            onToggle={() => setDurationOpen(!durationOpen)}
                            icon={Brain}
                            badge="Required"
                        >
                            <div className="space-y-6">
                                <DurationSelect
                                    duration={duration}
                                    onset={onset}
                                    onDurationChange={setDuration}
                                    onOnsetChange={setOnset}
                                />
                                <SeveritySlider
                                    value={severity}
                                    onChange={setSeverity}
                                />
                            </div>
                        </CollapsibleSection>

                        {/* Body Location Section - Optional */}
                        <CollapsibleSection
                            title="Body Location"
                            isOpen={locationOpen}
                            onToggle={() => setLocationOpen(!locationOpen)}
                            icon={MapPin}
                            badge="Optional"
                        >
                            <BodyLocationSelector
                                selectedRegions={bodyRegions}
                                onRegionToggle={setBodyRegions}
                            />
                        </CollapsibleSection>

                        {/* Medical History Section - Optional */}
                        <CollapsibleSection
                            title="Medical History"
                            isOpen={historyOpen}
                            onToggle={() => setHistoryOpen(!historyOpen)}
                            icon={History}
                            badge="Optional"
                        >
                            <MedicalHistoryForm
                                conditions={medicalConditions}
                                medications={medications}
                                allergies={allergies}
                                onConditionsChange={setMedicalConditions}
                                onMedicationsChange={setMedications}
                                onAllergiesChange={setAllergies}
                            />
                        </CollapsibleSection>

                        {/* Patient Information */}
                        <Card padding="md">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                                Patient Information (Optional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Your age"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                        min="1"
                                        max="120"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={loading}
                                disabled={!isFormValid() || loading}
                                className="flex-1"
                            >
                                <Search className="w-5 h-5" />
                                Analyze Symptoms
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="lg"
                                onClick={handleNewSession}
                                disabled={loading}
                            >
                                Reset Form
                            </Button>
                        </div>
                    </form>

                    {/* Analysis Results */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8"
                        >
                            <Card padding="md" className="border-l-4 border-l-blue-600">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        Analysis Results
                                    </h3>
                                    <UrgencyBadge level={result.urgencyLevel || urgencyLevel} />
                                </div>

                                <div className="prose prose-sm text-slate-700 mb-4">
                                    {result.analysis}
                                </div>

                                {result.possibleConditions?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-slate-900 mb-2">
                                            Possible Conditions:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.possibleConditions.map((condition, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg"
                                                >
                                                    {condition}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.recommendedSpecialties?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-slate-900 mb-2">
                                            Recommended Specialists:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.recommendedSpecialties.map((specialty, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-lg"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}

                    {/* Doctor Recommendations */}
                    {doctors.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Recommended Doctors ({doctors.length})
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {doctors.slice(0, 6).map((doctor) => (
                                    <DoctorRecommendationCard
                                        key={doctor.id}
                                        doctor={doctor}
                                        onBook={handleBookAppointment}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Card padding="md" className="mt-6 border-l-4 border-l-rose-600 bg-rose-50">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <div>
                                    <h4 className="font-medium text-rose-800 mb-1">
                                        Analysis Error
                                    </h4>
                                    <p className="text-sm text-rose-700">{error}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="mt-8 flex justify-center">
                            <LoadingSpinner message="Analyzing your symptoms..." />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    {/* AI Assistant Info */}
                    <Card padding="md">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-teal-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                                AI Health Assistant
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">
                                Powered by Mistral AI
                            </p>
                            <img
                                src="/images/ai-health-assistant.svg"
                                alt="AI Health Assistant"
                                className="w-full h-24 object-contain"
                            />
                        </div>
                    </Card>

                    {/* Instructions */}
                    <Card padding="md">
                        <h3 className="font-semibold text-slate-900 mb-3">
                            How It Works
                        </h3>
                        <ol className="space-y-2 text-sm text-slate-600">
                            <li className="flex gap-2">
                                <span className="font-medium text-blue-600 shrink-0">1.</span>
                                Select your symptoms from common conditions
                            </li>
                            <li className="flex gap-2">
                                <span className="font-medium text-blue-600 shrink-0">2.</span>
                                Rate severity and specify duration
                            </li>
                            <li className="flex gap-2">
                                <span className="font-medium text-blue-600 shrink-0">3.</span>
                                Add location and medical history (optional)
                            </li>
                            <li className="flex gap-2">
                                <span className="font-medium text-blue-600 shrink-0">4.</span>
                                Get AI analysis and doctor recommendations
                            </li>
                        </ol>
                    </Card>

                    {/* Medical Disclaimer */}
                    <Card padding="md" className="bg-amber-50 border-amber-200">
                        <div className="flex gap-2">
                            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 text-sm mb-1">
                                    Medical Disclaimer
                                </h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    This tool provides general health information only.
                                    Always consult healthcare professionals for medical advice,
                                    diagnosis, or treatment decisions.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Emergency Notice */}
                    <Card padding="md" className="bg-rose-50 border-rose-200">
                        <div className="text-center">
                            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-rose-800 text-sm mb-1">
                                Emergency Situations
                            </h4>
                            <p className="text-xs text-rose-700 mb-3">
                                For life-threatening emergencies, call 119 immediately
                            </p>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleCallEmergency}
                                className="w-full"
                            >
                                Call 119 Emergency
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SymptomCheckerPage;