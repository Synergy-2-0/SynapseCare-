import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * AppointmentStatusChart Component
 *
 * Pie chart showing appointment status breakdown
 * Features animated segments and color-coded statuses
 */
const AppointmentStatusChart = ({ data = [] }) => {
    // Default data if none provided
    const defaultData = [
        { name: 'Confirmed', value: 145, color: '#10b981' },
        { name: 'Pending', value: 67, color: '#f59e0b' },
        { name: 'Completed', value: 312, color: '#1366d9' },
        { name: 'Cancelled', value: 28, color: '#ef4444' }
    ];

    const chartData = data.length > 0 ? data : defaultData;

    const COLORS = chartData.map(item => item.color || '#64748b');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default AppointmentStatusChart;
