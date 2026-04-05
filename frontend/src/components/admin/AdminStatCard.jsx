import React from 'react';
import { motion } from 'framer-motion';

const AdminStatCard = ({ label, value, icon: Icon, trend, colorClass, bgColorClass, delay = 0 }) => {
    const isPositive = trend?.isPositive;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white rounded-[20px] p-5 border border-slate-50 transition-all group flex items-start justify-between shadow-sm hover:shadow-md"
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`p-2 rounded-xl scale-95 ${bgColorClass || 'bg-slate-50'} ${colorClass || 'text-teal-600'} transition-all shadow-sm`}>
                            <Icon size={18} weight="light" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 font-sans">{label}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums mt-1">
                        {value}
                    </div>
                </div>
                
                {trend && (
                    <div className="flex items-center gap-2 mt-4">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {trend.value}
                        </div>
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Global Sync</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminStatCard;
