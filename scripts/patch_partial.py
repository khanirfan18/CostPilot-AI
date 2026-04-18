import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# Replace the "If the text looks somewhat like a financial agreement..." block.
text = re.sub(
    r'(If the text looks somewhat like a financial agreement.*?\n\{"error": "PARTIAL"[^\}]*\}\n\nOnly if the agreement is reasonably complete should you proceed with the calculation\.)',
    r'',
    text,
    flags=re.DOTALL
)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
