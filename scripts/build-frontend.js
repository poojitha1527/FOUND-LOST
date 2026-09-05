const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const source = path.join(projectRoot, 'frontend');
const destination = path.join(projectRoot, 'build');

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
fs.writeFileSync(
	path.join(destination, 'config.js'),
	`window.APP_CONFIG = { API_URL: ${JSON.stringify(apiUrl)} };\n`,
	'utf8'
);
console.log(`Frontend copied to ${path.relative(projectRoot, destination)}`);