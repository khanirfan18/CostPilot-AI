import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Let's completely replace the gemini endpoint to the correct generic path for 1.5 flash
content = content.replace(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent'
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)
