const fs = require('fs');

const file = 'd:/Projects/synapcare/frontend/src/pages/doctor/telemedicine-center.jsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
    /<div className="w-\[320px\] bg-slate-900 border-l border-white\/10 flex flex-col">[\s\S]*?<div className="flex-1 p-4">/g,
    `<div className="w-[380px] bg-slate-900/80 backdrop-blur-3xl border-l border-white/10 flex flex-col">
                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 m-5 rounded-2xl border border-white/5">
                            {['Notes', 'Reports', 'Chat'].map(tab => (
                                <button key={tab} className={\`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all \${tab === 'Notes' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white'}\`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-4">`
);

fs.writeFileSync(file, data);
console.log('Fixed!');