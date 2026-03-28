import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { Download, TrendingUp, TrendingDown, DollarSign, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
    return (
        <DashboardLayout>
            <Header title="Earnings & Analytics" subtitle="Financial overview and operational insights" />
            
            <div className="flex justify-between items-end mt-6">
                <div className="flex gap-2 p-1.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl">
                    {['This Week', 'This Month', 'This Year', 'All Time'].map((tab, i) => (
                        <button key={tab} className={`px-5 py-2.5 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${i === 1 ? 'bg-[var(--accent-teal)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-color)] rounded-[var(--radius-sm)] text-sm font-bold shadow-sm hover:text-[var(--accent-teal)] transition-colors">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="surface-card surface-card-hover !rounded-[var(--radius-3xl)] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Revenue</h3>
                    <div className="mt-4 flex items-end gap-3">
                        <span className="text-5xl font-black font-serif tracking-tight text-[var(--accent-teal)] group-hover:scale-105 transition-transform origin-left">රු 124,500</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
                        <TrendingUp className="w-4 h-4" /> +12% from last month
                    </div>
                </div>

                <div className="surface-card surface-card-hover !rounded-[var(--radius-3xl)] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Activity className="w-24 h-24" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Consultations</h3>
                    <div className="mt-4 flex items-end gap-3">
                        <span className="text-5xl font-black font-serif tracking-tight text-[var(--text-primary)] group-hover:scale-105 transition-transform origin-left">148</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded">
                        <TrendingDown className="w-4 h-4" /> -2% from last month
                    </div>
                </div>

                <div className="surface-card surface-card-hover !rounded-[var(--radius-3xl)] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Calendar className="w-24 h-24" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Cancellation Rate</h3>
                    <div className="mt-4 flex items-end gap-3">
                        <span className="text-5xl font-black font-serif tracking-tight text-[var(--text-primary)] group-hover:scale-105 transition-transform origin-left">4.2%</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
                        <TrendingDown className="w-4 h-4" /> -1.1% from last month
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="surface-card !rounded-[var(--radius-3xl)] p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    {/* Placeholder for chart */}
                    <div className="w-full flex justify-between items-end h-40 gap-2 opacity-50 px-8">
                        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                            <div key={i} className="w-full bg-gradient-to-t from-teal-400 to-sky-400 rounded-t-lg hover:opacity-100 transition-opacity cursor-pointer opacity-70" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm font-bold text-[var(--text-muted)]">Revenue Timeline Chart (Placeholder)</p>
                </div>
                
                <div className="surface-card !rounded-[var(--radius-3xl)] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                        <h3 className="font-bold text-[var(--text-primary)]">Recent Payouts</h3>
                    </div>
                    <div className="divide-y divide-[var(--border-color)]">
                        {[
                            { id: '#TRX-9982', date: 'Oct 24, 2023', amount: 'රු 32,500', status: 'Completed' },
                            { id: '#TRX-9981', date: 'Oct 17, 2023', amount: 'රු 41,200', status: 'Completed' },
                            { id: '#TRX-9980', date: 'Oct 10, 2023', amount: 'රු 28,900', status: 'Completed' },
                        ].map((tx, i) => (
                            <div key={i} className="flex justify-between items-center p-4 hover:bg-[var(--bg-hover)] transition-colors">
                                <div>
                                    <div className="font-bold text-sm text-[var(--text-primary)]">{tx.id}</div>
                                    <div className="text-xs text-[var(--text-muted)] mt-1">{tx.date}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-[var(--text-primary)]">{tx.amount}</div>
                                    <div className="text-xs font-bold text-green-600 mt-1">{tx.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}

