const fs = require('fs');
const path = require('path');

const map = {
  '#0a0e17': '#0A0A12',
  '#111827': '#12121A',
  '#1a2235': '#1A1A25',
  '#00c4e0': '#22D3EE',  // changing old cyan to new cyan accent
  '#7c3aed': '#8B5CF6',
  '#f9fafb': '#E4E4E7',
  '#6b7280': '#71717A',
  '#9ca3af': '#A1A1AA',
  '#1f2937': '#1A1A25',
  '#374151': '#27272A'
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [oldC, newC] of Object.entries(map)) {
        // case insensitive replace
        const regex = new RegExp(oldC, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newC);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Updated ${full}`);
      }
    }
  }
}

walkDir(path.join(__dirname, 'components'));
console.log("Done.");
