import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * UserGrowthChart Component
 *
 * Dual-line chart showing patient and doctor growth over time
 * Features animated drawing on mount
 */
const UserGrowthChart = ({ data = [] }) => {
    // Default data if none provided
    const defaultData = [
        { month: 'Jan', patients: 450, doctors: 23 },
        { month: 'Feb', patients: 520, doctors: 28 },
        { month: 'Mar', patients: 610, doctors: 34 },
        { month: 'Apr', patients: 720, doctors: 41 },
        { month: 'May', patients: 850, doctors: 48 },
        { month: 'Jun', patients: 980, doctors: 56 }
    ];

    const chartData = data.length > 0 ? data : defaultData;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="patients"
                        stroke="#1366d9"
                        strokeWidth={3}
                        dot={{ fill: '#1366d9', r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        name="Patients"
                    />
                    <Line
                        type="monotone"
                        dataKey="doctors"
                        stroke="#0aa7a0"
                        strokeWidth={3}
                        dot={{ fill: '#0aa7a0', r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        animationBegin={200}
                        name="Doctors"
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default UserGrowthChart;
