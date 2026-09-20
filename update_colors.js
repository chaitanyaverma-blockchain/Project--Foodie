const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Hex
  let newContent = content
    .replace(/#FF6B00/ig, '#FF6B00')
    .replace(/#FF7A1A/ig, '#FF7A1A')
    .replace(/#E56000/ig, '#E56000');
    
  // Replace rgba(255,107,0
  newContent = newContent
    .replace(/234,\s*88,\s*12/g, '255,107,0')
    .replace(/255,107,0/g, '255,107,0');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.gemini') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(__dirname);
console.log("Color replacement complete.");
