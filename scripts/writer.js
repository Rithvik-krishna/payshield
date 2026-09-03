const fs = require('fs');
const path = require('path');
const file = process.argv[2];
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data, 'utf8');
  console.log("Wrote " + file + " (" + data.length + " bytes)");
});
