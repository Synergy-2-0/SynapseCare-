import React, { useState } from 'react';
import { FlaskConical, Plus, X, Clock, MapPin, AlertCircle } from 'lucide-react';
import { LAB_TESTS } from '../../constants/icdCodes';

/**
 * LabOrderForm Component
 *
 * Laboratory and diagnostic test ordering system
 * Professional medical test requisition with categories and urgency levels
 */
const LabOrderForm = ({
    labOrders = [],
    onChange,
    className = ''
}) => {
    const [orders, setOrders] = useState(labOrders.length > 0 ? labOrders : [createEmptyOrder()]);

    function createEmptyOrder() {
        return {
            id: Date.now() + Math.random(),
            testName: '',
            testCode: '',
            category: '',
            urgency: 'routine',
            labFacility: '',
            clinicalIndication: '',
            specialInstructions: '',
            fasting: false,
            timeSensitive: false
        };
    }

    const handleOrderChange = (id, field, value) => {
        const updated = orders.map(order => {
            if (order.id === id) {
                const newOrder = { ...order, [field]: value };

                // Auto-fill test details when test is selected
                if (field === 'testName') {
                    const foundTest = LAB_TESTS.find(test => test.name === value);
                    if (foundTest) {
                        newOrder.testCode = foundTest.code;
                        newOrder.category = foundTest.category;
                    }
                }

                return newOrder;
            }
            return order;
        });

        setOrders(updated);
        if (onChange) {
            onChange(updated);
        }
    };

    const addOrder = () => {
        const newOrders = [...orders, createEmptyOrder()];
        setOrders(newOrders);
        if (onChange) {
            onChange(newOrders);
        }
    };

    const removeOrder = (id) => {
        if (orders.length > 1) {
            const filtered = orders.filter(order => order.id !== id);
            setOrders(filtered);
            if (onChange) {
                onChange(filtered);
            }
        }
    };

    const urgencyOptions = [
        { value: 'routine', label: 'Routine', color: 'text-slate-600', bg: 'bg-slate-100' },
        { value: 'urgent', label: 'Urgent', color: 'text-amber-600', bg: 'bg-amber-100' },
        { value: 'stat', label: 'STAT', color: 'text-rose-600', bg: 'bg-rose-100' }
    ];

    const labFacilities = [
        'City Diagnostics Laboratory',
        'Central Hospital Lab',
        'MediLab Testing Center',
        'Advanced Diagnostic Imaging',
        'Regional Medical Laboratory',
        'QuickTest Express'
    ];

    const testCategories = [...new Set(LAB_TESTS.map(test => test.category))];

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-blue-600" />
                        Laboratory Orders
                    </h2>
                    <p className="text-sm text-slate-600">
                        Order lab tests, imaging, and diagnostic procedures
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addOrder}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Lab Test
                </button>
            </div>

            <div className="space-y-6">
                {orders.map((order, index) => (
                    <div key={order.id} className="border border-slate-200 rounded-lg p-5 bg-white">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-slate-900">
                                    Lab Order #{index + 1}
                                </h3>
                                {/* Urgency Badge */}
                                {order.urgency && order.urgency !== 'routine' && (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        urgencyOptions.find(u => u.value === order.urgency)?.bg
                                    } ${urgencyOptions.find(u => u.value === order.urgency)?.color}`}>
                                        {urgencyOptions.find(u => u.value === order.urgency)?.label}
                                    </span>
                                )}
                            </div>
                            {orders.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeOrder(order.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Test Details */}
                            <div className="space-y-4">
                                {/* Test Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Laboratory Test *
                                    </label>
                                    <select
                                        value={order.testName}
                                        onChange={(e) => handleOrderChange(order.id, 'testName', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    >
                                        <option value="">Select test...</option>
                                        {testCategories.map(category => (
                                            <optgroup key={category} label={category}>
                                                {LAB_TESTS
                                                    .filter(test => test.category === category)
                                                    .map(test => (
                                                        <option key={test.code} value={test.name}>
                                                            {test.name} ({test.code})
                                                        </option>
                                                    ))
                                                }
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                {/* Test Code & Category */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Test Code
                                        </label>
                                        <input
                                            type="text"
                                            value={order.testCode}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            value={order.category}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Urgency */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        Urgency Level *
                                    </label>
                                    <select
                                        value={order.urgency}
                                        onChange={(e) => handleOrderChange(order.id, 'urgency', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    >
                                        {urgencyOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Special Requirements */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Special Requirements
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={order.fasting}
                                                onChange={(e) => handleOrderChange(order.id, 'fasting', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                            />
                                            <span className="text-sm text-slate-700">Fasting Required (8-12 hours)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={order.timeSensitive}
                                                onChange={(e) => handleOrderChange(order.id, 'timeSensitive', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                            />
                                            <span className="text-sm text-slate-700">Time-Sensitive Collection</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Instructions & Facility */}
                            <div className="space-y-4">
                                {/* Lab Facility */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        Preferred Lab Facility
                                    </label>
                                    <select
                                        value={order.labFacility}
                                        onChange={(e) => handleOrderChange(order.id, 'labFacility', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    >
                                        <option value="">Select lab facility...</option>
                                        {labFacilities.map(facility => (
                                            <option key={facility} value={facility}>
                                                {facility}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clinical Indication */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Clinical Indication *
                                    </label>
                                    <textarea
                                        value={order.clinicalIndication}
                                        onChange={(e) => handleOrderChange(order.id, 'clinicalIndication', e.target.value)}
                                        placeholder="Reason for test, suspected diagnosis, monitoring..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                                        rows="3"
                                    />
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Special Instructions
                                    </label>
                                    <textarea
                                        value={order.specialInstructions}
                                        onChange={(e) => handleOrderChange(order.id, 'specialInstructions', e.target.value)}
                                        placeholder="Collection instructions, patient preparation, handling requirements..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        {order.testName && order.clinicalIndication && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="text-sm font-medium text-emerald-800 mb-1">Lab Order Summary:</div>
                                <div className="text-sm text-emerald-700">
                                    <strong>{order.testName}</strong> ({order.testCode}) - {order.urgency.toUpperCase()}
                                </div>
                                <div className="text-xs text-emerald-600 mt-1">
                                    Indication: {order.clinicalIndication}
                                </div>
                                {(order.fasting || order.timeSensitive) && (
                                    <div className="text-xs text-emerald-600 mt-1">
                                        Requirements: {[
                                            order.fasting ? 'Fasting' : '',
                                            order.timeSensitive ? 'Time-sensitive' : ''
                                        ].filter(Boolean).join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lab Order Guidelines */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 text-sm mb-1">
                            Lab Order Guidelines
                        </h4>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                            <li>• <strong>STAT:</strong> Results needed within 1 hour for critical decisions</li>
                            <li>• <strong>Urgent:</strong> Results needed within 4-6 hours</li>
                            <li>• <strong>Routine:</strong> Results within 24-48 hours</li>
                            <li>• Always provide clear clinical indication for test justification</li>
                            <li>• Specify fasting requirements for lipid panels and glucose tests</li>
                            <li>• Consider patient condition when selecting urgency level</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Orders Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Total Lab Orders: {orders.length}</span>
                <div className="flex gap-4">
                    <span>Complete: {orders.filter(o => o.testName && o.clinicalIndication).length}</span>
                    <span>STAT: {orders.filter(o => o.urgency === 'stat').length}</span>
                    <span>Urgent: {orders.filter(o => o.urgency === 'urgent').length}</span>
                </div>
            </div>
        </div>
    );
};

export default LabOrderForm;