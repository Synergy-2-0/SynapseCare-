const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let foundErrors = false;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
            const absoluteImportPath = path.resolve(path.dirname(file), importPath);
            // Check if file exists exactly with this case
            let exists = false;
            const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
            for (let ext of extensions) {
                if (fs.existsSync(absoluteImportPath + ext)) {
                    // Check actual file system case
                    const dirName = path.dirname(absoluteImportPath + ext);
                    const baseName = path.basename(absoluteImportPath + ext);
                    // On Windows existsSync is case-insensitive, we need to check readdirSync
                    if (fs.existsSync(dirName)) {
                        const actualFiles = fs.readdirSync(dirName);
                        if (actualFiles.includes(baseName)) {
                            exists = true;
                            break;
                        }
                    }
                }
            }
            if (!exists && fs.existsSync(absoluteImportPath)) {
                console.log(`CASE MISMATCH in ${file}: import '${importPath}'`);
                foundErrors = true;
            }
        }
    }
});

if (!foundErrors) console.log('No case mismatches found.');
