const fs = require('fs');

const file = 'd:/Projects/synapcare/frontend/src/pages/doctor/telemedicine-center.jsx';
let data = fs.readFileSync(file, 'utf8');

// Fix Tabs
data = data.replace(
    /className=\{\\px-4 py-3 text-sm font-bold transition-all relative \\\\\}/g,
    `className={\`px-4 py-3 text-[15px] font-black tracking-wide uppercase transition-all relative \${activeTab === tab ? 'text-[var(--accent-teal)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}\`}`
);

// Fix Upcoming card
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] border-l-\[3px\] border-l-\[var\(--accent-teal\)\] border-y border-r border-\[var\(--border-color\)\] rounded-r-\[var\(--radius-lg\)\] p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-6 hover:shadow-md transition-all group"/g,
    `className="surface-card !rounded-[var(--radius-3xl)] !border-2 !border-indigo-100 shadow-[0_0_25px_rgba(99,102,241,0.2)] p-8 flex flex-col sm:flex-row justify-between gap-6 hover:-translate-y-1 transition-all group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-50/50 before:to-transparent before:-z-10"`
);

// Fix Join Session button
data = data.replace(
    /className="w-full py-2\.5 text-sm font-bold bg-\[var\(--accent-teal\)\] text-white rounded shadow hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-2"/g,
    `className="btn-primary w-full !rounded-2xl !py-4 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"`
);

// Fix Pulse Badge
data = data.replace(
    /className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded border border-amber-200 animate-pulse"/g,
    `className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-full border border-indigo-200 shadow-sm animate-pulse"`
);

// Fix Post session modal
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] rounded-\[var\(--radius-lg\)\] shadow-2xl p-6 w-full max-w-2xl border border-\[var\(--border-color\)\]"/g,
    `className="glass-morphism rounded-[var(--radius-3xl)] shadow-[var(--shadow-premium-lg)] p-8 w-full max-w-2xl border-white/50 backdrop-blur-3xl"`
);

// Fix textarea backticks
data = data.replace(
    /className=\{\\w-full h-32 bg-\[var\(--bg-base\)\] border \\ rounded p-3 text-sm focus:border-\[var\(--accent-teal\)\] outline-none\\\}/g,
    `className="input-field min-h-[160px] resize-none !rounded-2xl"`
);

fs.writeFileSync(file, data);
console.log('Fixed UI mapping!');