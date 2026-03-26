import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * AppointmentTrendChart Component
 *
 * Line chart showing appointment trends over time
 * Features animated drawing on mount
 */
const AppointmentTrendChart = ({ data = [] }) => {
    // Default data if none provided
    const defaultData = [
        { date: 'Mon', count: 12 },
        { date: 'Tue', count: 19 },
        { date: 'Wed', count: 15 },
        { date: 'Thu', count: 22 },
        { date: 'Fri', count: 18 },
        { date: 'Sat', count: 8 },
        { date: 'Sun', count: 5 }
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
                        dataKey="date"
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
                        labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#1366d9"
                        strokeWidth={3}
                        dot={{ fill: '#1366d9', r: 5 }}
                        activeDot={{ r: 7 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default AppointmentTrendChart;
