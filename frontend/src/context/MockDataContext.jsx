import React, { createContext, useState, useEffect } from 'react';

export const MockDataContext = createContext();

export const MockDataProvider = ({ children }) => {
    // Shared State for Dashboard, Appointments, Patients
    const [appointments, setAppointments] = useState([
        { id: 1, patient: 'Nimal Perera', time: '09:00 AM', type: 'General Consult', status: 'Pending', avatar: null, date: new Date().toISOString() },
        { id: 2, patient: 'Kasun Wijesinghe', time: '10:30 AM', type: 'Follow-up', status: 'Confirmed', avatar: null, date: new Date().toISOString() },
        { id: 3, patient: 'Amara Silva', time: '11:15 AM', type: 'Telemedicine', status: 'In-Progress', avatar: null, date: new Date().toISOString() }
    ]);
    
    const [prescriptions, setPrescriptions] = useState([
        { id: '9012', date: 'Oct 24, 2023', patient: 'Kamal Silva', dx: 'J01.9X - Acute sinusitis', status: 'Dispensed', meds: ['Amoxicillin', 'Ibuprofen'] },
        { id: '9011', date: 'Oct 24, 2023', patient: 'Nimali Fernando', dx: 'E11.9 - Type 2 diabetes', status: 'Active', meds: ['Metformin'] }
    ]);

    const [stats, setStats] = useState({
        todayPatients: 12,
        pendingReports: 5,
        totalRevenue: 124500,
        consultations: 148
    });

    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial network latency
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Actions
    const updateAppointmentStatus = async (id, newStatus) => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
        setIsLoading(false);
    };

    const addPrescription = async (data) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const newPx = { 
            id: Math.floor(Math.random() * 10000).toString(), 
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            patient: data.patientName || 'Unknown', 
            dx: data.diagnosis, 
            status: 'Active', 
            meds: data.medications.map(m => m.drugName) 
        };
        setPrescriptions([newPx, ...prescriptions]);
        setIsLoading(false);
    };

    return (
        <MockDataContext.Provider value={{
            appointments,
            prescriptions,
            stats,
            isLoading,
            updateAppointmentStatus,
            addPrescription
        }}>
            {children}
        </MockDataContext.Provider>
    );
};
