const fs = require('fs');

const file = 'd:/Projects/synapcare/frontend/src/pages/doctor/schedule.jsx';
let data = fs.readFileSync(file, 'utf8');

// Fix Side panel backgrounds
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-\[var\(--radius-lg\)\] p-6 shadow-sm"/g,
    `className="surface-card !rounded-[var(--radius-3xl)] p-8"`
);

// Fix weekly grid backgrounds
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-\[var\(--radius-lg\)\] shadow-sm overflow-hidden flex flex-col h-full"/g,
    `className="surface-card !rounded-[var(--radius-3xl)] overflow-hidden flex flex-col h-full"`
);

// Fix standard inputs to standard classes
data = data.replace(
    /className="w-full p-2\.5 bg-\[var\(--bg-base\)\] border border-\[var\(--border-color\)\] rounded shadow-sm text-sm focus:border-\[var\(--accent-teal\)\] outline-none"/g,
    `className="input-field"`
);
data = data.replace(
    /className="p-2 bg-white border border-\[var\(--border-color\)\] rounded shadow-sm text-sm outline-none w-32"/g,
    `className="input-field !w-32"`
);
data = data.replace(
    /className="p-2 bg-white border border-\[var\(--border-color\)\] rounded shadow-sm text-sm outline-none flex-1"/g,
    `className="input-field flex-1"`
);

// Fix day box wrapper
data = data.replace(
    /className=\{\\p-4 rounded-lg border \\ transition-colors\\\}/g,
    `className={\`p-6 !rounded-[var(--radius-2xl)] border \${isActive ? 'border-[var(--accent-teal)]/30 bg-gradient-to-r from-[var(--color-primary-soft)] to-transparent' : 'border-[var(--border-color)] bg-[var(--bg-base)] opacity-60'} transition-all duration-300\`}`
);

// Fix the active text
data = data.replace(
    /<span className=\{\\r\\nont-bold \\\\\}>\{day\}<\/span>/g,
    `<span className={\`text-lg font-bold font-serif \${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}\`}>{day}</span>`
);

// Save buttons
data = data.replace(
    /className="bg-\[var\(--accent-teal\)\] text-white px-6 py-2\.5 rounded font-bold text-sm shadow hover:bg-teal-700 active:scale-95 transition-all"/g,
    `className="btn-primary !rounded-2xl"`
);

fs.writeFileSync(file, data);
console.log('Fixed schedule!');