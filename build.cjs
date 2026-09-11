const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'out');
fs.rmSync(output, {recursive: true, force: true});
fs.cpSync(path.join(__dirname, 'public'), output, {recursive: true});
console.log('Static build ready: out/');
