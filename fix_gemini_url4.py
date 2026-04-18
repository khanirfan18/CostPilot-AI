import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Since it's April 2026, Google has completely removed gemini-1.5 variants from their API list. Their latest stable model returned by their server is gemini-2.5-flash.
content = content.replace(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)
