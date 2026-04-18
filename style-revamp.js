const fs = require('fs');
const path = require('path');

const colorsMap = {
  '#22d3ee': '#8B5CF6',
  '#22D3EE': '#8B5CF6',
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
      
      // Color swap: transform the misapplied cyan to primary violet
      for (const [oldC, newC] of Object.entries(colorsMap)) {
        if (content.includes(oldC)) {
          content = content.split(oldC).join(newC);
          changed = true;
        }
      }

      // Font injections
      // 1. Add font-heading to text-lg, text-xl, text-2xl, etc., and font-bold unless already there
      const headingPatterns = [
        /(className="[^"]*text-(?:lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)[^"]*")/g,
        /(className="[^"]*font-bold[^"]*")/g,
        /(className="[^"]*font-black[^"]*")/g
      ];

      headingPatterns.forEach(regex => {
        content = content.replace(regex, (match) => {
          if (!match.includes('font-heading') && !match.includes('font-mono') && !match.includes('font-numeric')) {
            changed = true;
            return match.replace('className="', 'className="font-heading ');
          }
          return match;
        });
      });

      // 2. Add tabular-nums to formatCurrency calls and some specific regexes
      const moneyPattern = /(className="[^"]*)([^"]*)(">)[^<]*formatCurrency/g;
      content = content.replace(moneyPattern, (match, p1, p2, p3) => {
        if (!p2.includes('tabular-nums')) {
          changed = true;
          return p1 + p2 + ' tabular-nums' + p3;
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Updated ${full}`);
      }
    }
  }
}

// Except skipping hero.tsx maybe? Actually hero is fine if it turns more violet or already is.
// I will just run it on all components.
walkDir(path.join(__dirname, 'components'));
console.log("Done.");
