import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const DEPT_COLORS = ['#0D9488', '#FACC15', '#6366F1', '#10B981', '#EC4899'];

export const PatientTrendsChart = ({ data, title }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-base font-bold tracking-tight text-slate-900">{title || "Visit Analytics"}</h3>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest font-sans">Monthly performance</p>
      </div>
      <div className="flex gap-3 items-center">
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Male</span></div>
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Female</span></div>
      </div>
    </div>

    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis 
             dataKey="name" 
             axisLine={false} 
             tickLine={false} 
             tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: '700' }} 
             dy={8} 
          />
          <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: '700' }} 
             dx={-8}
          />
          <Tooltip 
             contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                fontSize: '10px', 
                fontWeight: '700', 
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)'
             }} 
          />
          <Area 
             type="monotone" 
             dataKey="male" 
             stroke="#0D9488" 
             strokeWidth={3} 
             fillOpacity={1} 
             fill="url(#colorMale)" 
             activeDot={{ r: 4, strokeWidth: 0, fill: '#0D9488' }}
          />
          <Area 
             type="monotone" 
             dataKey="female" 
             stroke="#818CF8" 
             strokeWidth={3} 
             fillOpacity={1} 
             fill="url(#colorFemale)" 
             activeDot={{ r: 4, strokeWidth: 0, fill: '#818CF8' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export const DepartmentDoughnutChart = ({ data, title }) => (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 hover:shadow-md transition-all"
    >
      <div className="mb-4">
        <h3 className="text-base font-bold tracking-tight text-slate-900">{title || "Distributions"}</h3>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest font-sans">Patient specializations</p>
      </div>

      <div className="h-[200px] w-full flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ 
                 borderRadius: '12px', 
                 border: 'none', 
                 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                 fontSize: '10px', 
                 fontWeight: '700',
                 padding: '8px 12px'
               }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Yield</p>
            <p className="text-xl font-black text-slate-900 leading-tight">100%</p>
        </div>
      </div>

      <div className="space-y-2 mt-4">
          {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between group cursor-help">
                  <div className="flex items-center gap-2">
                       <div 
                         className="w-2.5 h-2.5 rounded-full shadow-sm" 
                         style={{ backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length] }} 
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tabular-nums">{item.value}%</span>
              </div>
          ))}
      </div>
    </motion.div>
);

export const MiniSparkline = ({ data, color, title, value, percentage }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-2">
            <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                 <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{value}</p>
                 <div className="flex items-center gap-1.5 mt-1.5">
                     <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">+{percentage}%</span>
                     <span className="text-[8px] text-slate-300 font-bold uppercase tracking-tight">7d window</span>
                 </div>
            </div>
        </div>
        <div className="h-12 w-full -mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                     <defs>
                        <linearGradient id={`colorSpark-${title}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                     <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={color} 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill={`url(#colorSpark-${title})`} 
                     />
                 </AreaChart>
             </ResponsiveContainer>
        </div>
    </div>
);
