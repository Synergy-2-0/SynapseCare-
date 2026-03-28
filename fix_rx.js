const fs = require('fs');

const file = 'd:/Projects/synapcare/frontend/src/pages/doctor/prescriptions.jsx';
let data = fs.readFileSync(file, 'utf8');

// Fix the status badge
data = data.replace(
    /className=\{\\inline-block px-2 py-1 rounded-full text-xs font-bold border \\\\\}/g,
    `className={\`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border \${px.status === 'Signed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}\`}`
);

// Fix Table styling to be rounded
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-\[var\(--radius-lg\)\] shadow-sm overflow-hidden"/g,
    `className="surface-card !rounded-[var(--radius-3xl)] overflow-hidden border-0"`
);

// Form modal to Glass morphism
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-\[var\(--border-color\)\]"/g,
    `className="glass-morphism w-full max-w-2xl h-full shadow-[var(--shadow-premium-lg)] flex flex-col border-l border-white/50 backdrop-blur-3xl !rounded-l-[var(--radius-3xl)] my-2"`
);

// Select inputs
data = data.replace(
    /className=\{\\w-full p-3 bg-\[var\(--bg-base\)\] border \\ rounded-\[var\(--radius-sm\)\] text-sm shadow-sm outline-none focus:border-\[var\(--accent-teal\)\] focus:ring-1 focus:ring-\[var\(--accent-teal\)\] transition-all\\\}/g,
    `className="input-field !shadow-sm"`
);

// Textarea
data = data.replace(
    /className=\{\\w-full p-3 bg-\[var\(--bg-base\)\] border \\ rounded-\[var\(--radius-sm\)\] text-sm shadow-sm outline-none focus:border-\[var\(--accent-teal\)\] resize-none transition-all\\\}/g,
    `className="input-field !shadow-sm resize-none"`
);

// Inputs inside dynamic array (dosage, duration, etc.)
// Some of these might be inputs without backticks, but standard Tailwind:
// className={\`w-full p-2.5 ... \`} or similar. I'll just change `.bg-[var(--bg-base)]...`
data = data.replace(
    /className=\{\\w-full p-2\.5 bg-\[var\(--bg-base\)\] border \\ rounded-\[var\(--radius-sm\)\] text-sm focus:border-\[var\(--accent-teal\)\] outline-none\\\}/g,
    `className="input-field !py-2.5 !text-sm"`
);

// Main input search styling 
// `className="pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--accent-teal)] text-sm w-80 shadow-sm transition-all focus:ring-2 focus:ring-[var(--accent-teal)]"`
data = data.replace(
    /className="pl-10 pr-4 py-2 bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-\[var\(--radius-sm\)\] focus:outline-none focus:border-\[var\(--accent-teal\)\] text-sm w-80 shadow-sm transition-all focus:ring-2 focus:ring-\[var\(--accent-teal\)\]"/g,
    `className="input-field !pl-10 !w-80 !rounded-[var(--radius-2xl)] !shadow-sm !bg-white"`
);

// Buttons issue New
data = data.replace(
    /className="flex items-center gap-2 px-5 py-2\.5 bg-\[var\(--accent-teal\)\] hover:bg-teal-700 text-white rounded-\[var\(--radius-sm\)\] text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"/g,
    `className="btn-primary !rounded-xl"`
);

fs.writeFileSync(file, data);
console.log('Fixed rx components!');