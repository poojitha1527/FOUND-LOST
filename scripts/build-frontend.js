const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const source = path.join(projectRoot, 'frontend');
const destination = path.join(projectRoot, 'build');

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
console.log(`Frontend copied to ${path.relative(projectRoot, destination)}`);