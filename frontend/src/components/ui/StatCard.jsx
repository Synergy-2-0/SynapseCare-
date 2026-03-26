import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    bgColor,
    trend,
    onClick,
}) => {
    const CardWrapper = onClick ? motion.button : motion.div;

    return (
        <CardWrapper
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`p-10 surface-card surface-card-hover flex flex-col justify-between group h-full ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 ${bgColor} ${color} rounded-[1.2rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner border border-white/50`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                
                {trend && (
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${
                        trend.isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${trend.isPositive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {trend.value}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                    {value}
                </div>
                <div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</div>
                     <p className="text-xs text-slate-500 font-medium leading-none opacity-0 group-hover:opacity-100 transition-opacity">Cloud-synced metrics • Live</p>
                </div>
            </div>
        </CardWrapper>
    );
};

export default StatCard;
