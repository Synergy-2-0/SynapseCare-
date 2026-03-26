import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * RevenueChart Component
 *
 * Area chart showing revenue trends with gradient fill
 * Features animated drawing on mount
 */
const RevenueChart = ({ data = [] }) => {
    // Default data if none provided
    const defaultData = [
        { month: 'Jan', revenue: 12500 },
        { month: 'Feb', revenue: 15800 },
        { month: 'Mar', revenue: 18200 },
        { month: 'Apr', revenue: 22100 },
        { month: 'May', revenue: 26400 },
        { month: 'Jun', revenue: 31200 }
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
                <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1366d9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1366d9" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                        labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#1366d9"
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default RevenueChart;
