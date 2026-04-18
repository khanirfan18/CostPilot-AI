import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Specifically find and remove the {history.length > ...} UI block
start_tag = "{/* History */}"
if start_tag in content:
    start_idx = content.find(start_tag)
    end_tag = "            <label className=\"text-xs text-[#71717A] uppercase tracking-wider block mb-2\">"
    end_idx = content.find(end_tag)
    if end_idx > start_idx:
        content = content[:start_idx] + content[end_idx:]

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)

