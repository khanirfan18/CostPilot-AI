const fs = require('fs');
const path = require('path');

const colorsMap = {
  '#22D3EE': '#8B5CF6',
  '#22d3ee': '#8B5CF6',
  '#10b981': '#22C55E', // update green to fintech green
  '#f59e0b': '#EAB308', // update amber to fintech amber
  '#ef4444': '#EF4444', // red
  'text-white': 'text-[#E4E4E7]',
  'text-[#f9fafb]': 'text-[#E4E4E7]'
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      let original = content;
      
      // Colors
      for (const [oldC, newC] of Object.entries(colorsMap)) {
        content = content.split(oldC).join(newC);
      }

      // Fonts: 
      // Replace text-lg/xl/2xl with font-heading text-..
      const headingClasses = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'font-bold', 'font-black', 'font-semibold'];
      headingClasses.forEach(cls => {
        const regex = new RegExp(`className="([^"]*)\\b${cls}\\b([^"]*)"`, 'g');
        content = content.replace(regex, (match, prefix, suffix) => {
          if (!prefix.includes('font-heading') && !suffix.includes('font-heading') &&
              !prefix.includes('font-mono') && !suffix.includes('font-mono') &&
              !prefix.includes('font-numeric') && !suffix.includes('font-numeric')) {
            return `className="font-heading ${prefix}${cls}${suffix}"`;
          }
          return match;
        });
      });

      // Provide JetBrains Mono / tabular-nums for numeric fields
      const numericClasses = ['text-[#EAB308]', 'text-[#22C55E]', 'text-[#EF4444]'];
      numericClasses.forEach(cls => {
        const regex = new RegExp(`className="([^"]*)\\b${cls}\\b([^"]*)"`, 'g');
        content = content.replace(regex, (match, prefix, suffix) => {
          if (!prefix.includes('tabular-nums') && !suffix.includes('tabular-nums')) {
            return `className="tabular-nums font-numeric ${prefix}${cls}${suffix}"`;
          }
          return match;
        });
      });

      // Special check for AnalysisResults formatted currency
      content = content.replace(/className="text-2xl/g, 'className="text-2xl tabular-nums font-numeric')
      content = content.replace(/className="text-xl/g, 'className="text-xl tabular-nums font-numeric')

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Updated ${full}`);
      }
    }
  }
}

walkDir(path.join(__dirname, 'components'));
console.log("Done.");
