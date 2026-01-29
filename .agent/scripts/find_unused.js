const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.module.css'];

// Special Next.js files that are entry points and don't need to be imported
const NEXTJS_ENTRY_POINTS = [
    'page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx', 'not-found.tsx',
    'global-error.tsx', 'route.ts', 'default.tsx', 'template.tsx',
    'middleware.ts', 'robots.ts', 'sitemap.ts', 'manifest.ts',
    'opengraph-image.tsx', 'twitter-image.tsx', 'icon.png', 'apple-icon.png',
    'globals.css' // usually imported in layout, but safe to keep
];

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            if (extensions.includes(path.extname(file))) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

const allFiles = getAllFiles(srcDir);
const projectFiles = allFiles.map(f => path.relative(srcDir, f).replace(/\\/g, '/'));

// Map of "basename" -> usage count. 
// We simplify by searching for the file's basename (without extension) in other files.
// This is a rough heuristic but effective for finding completely orphaned components.
const usageMap = new Map();

projectFiles.forEach(f => {
    usageMap.set(f, 0);
});

console.log(`Scanning ${allFiles.length} files...`);

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    projectFiles.forEach(targetFile => {
        if (path.join(srcDir, targetFile) === file) return; // Don't count self

        const targetBasename = path.basename(targetFile, path.extname(targetFile));
        const targetDir = path.dirname(targetFile);

        // Simple heuristic: if the basename appears in the content, likely used.
        // We can be stricter by checking imports, but this catches dynamic imports too.
        // For component "Button.tsx", looking for "Button" in content.

        // Exclude index files from this simple check to avoid false positives on directory imports
        if (targetBasename === 'index') return;

        if (content.includes(targetBasename)) {
            usageMap.set(targetFile, (usageMap.get(targetFile) || 0) + 1);
        }
    });
});

console.log('\n--- POTENTIALLY UNUSED FILES ---\n');

const unused = [];

projectFiles.forEach(f => {
    const basename = path.basename(f);
    if (NEXTJS_ENTRY_POINTS.includes(basename)) return;

    // Skip index.ts files for now as they are often implicit
    if (basename.startsWith('index.')) return;

    if (usageMap.get(f) === 0) {
        unused.push(f);
        console.log(`[UNUSED] ${f}`);
    }
});

console.log(`\nFound ${unused.length} deletion candidates.`);
