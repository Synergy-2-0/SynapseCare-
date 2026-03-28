const fs = require('fs');

const file = 'd:/Projects/synapcare/frontend/src/pages/doctor/analytics.jsx';
let data = fs.readFileSync(file, 'utf8');

// Fix text backticks bug
data = data.replace(
    /className=\{\\px-4 py-2 text-sm font-bold rounded-md transition-colors \\\\\}/g,
    `className={\`px-5 py-2.5 text-sm font-black uppercase tracking-wider rounded-xl transition-all \${i === 1 ? 'bg-[var(--accent-teal)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}\`}`
);

// Fix bar chart height backticks
data = data.replace(
    /style=\{\{height: \\\\%\\\}\}/g,
    `style={{ height: \`\${h}%\` }}`
);

// Fix stat cards container
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-\[var\(--radius-lg\)\] p-6 shadow-sm relative overflow-hidden"/g,
    `className="surface-card surface-card-hover !rounded-[var(--radius-3xl)] p-8 relative overflow-hidden group"`
);

// Fix total revenue amount
data = data.replace(
    /<span className="text-4xl font-black font-serif tracking-tight text-\[var\(--accent-teal\)\]">රු 124,500<\/span>/g,
    `<span className="text-5xl font-black font-serif tracking-tight text-[var(--accent-teal)] group-hover:scale-105 transition-transform origin-left">රු 124,500</span>`
);
data = data.replace(
    /<span className="text-4xl font-black font-serif tracking-tight text-\[var\(--text-primary\)\]">148<\/span>/g,
    `<span className="text-5xl font-black font-serif tracking-tight text-[var(--text-primary)] group-hover:scale-105 transition-transform origin-left">148</span>`
);
data = data.replace(
    /<span className="text-4xl font-black font-serif tracking-tight text-\[var\(--text-primary\)\]">4.2%<\/span>/g,
    `<span className="text-5xl font-black font-serif tracking-tight text-[var(--text-primary)] group-hover:scale-105 transition-transform origin-left">4.2%</span>`
);

// Tab group
data = data.replace(
    /className="flex gap-2 p-1 bg-\[var\(--bg-base\)\] border border-\[var\(--border-color\)\] rounded-lg"/g,
    `className="flex gap-2 p-1.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl"`
);

// Bottom grid containers
data = data.replace(
    /className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-\[var\(--radius-lg\)\]/g,
    `className="surface-card !rounded-[var(--radius-3xl)]`
);

// Bar charts gradient
data = data.replace(
    /className="w-full bg-\[var\(--accent-teal\)\] rounded-t-sm"/g,
    `className="w-full bg-gradient-to-t from-teal-400 to-sky-400 rounded-t-lg hover:opacity-100 transition-opacity cursor-pointer opacity-70"`
);

fs.writeFileSync(file, data);
console.log('Fixed analytics!');