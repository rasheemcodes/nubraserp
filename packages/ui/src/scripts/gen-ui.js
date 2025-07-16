const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const indexFile = path.join(__dirname, '../index.ts');

const files = fs.readdirSync(componentsDir);

const exportLines = files
  .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts'))
  .map((file) => {
    const componentName = path.parse(file).name;
    return `export * from './components/${componentName}';`;
  });

const fileContent = exportLines.join('\n') + '\n';

fs.writeFileSync(indexFile, fileContent);

console.log('✅ index.ts generated!');
