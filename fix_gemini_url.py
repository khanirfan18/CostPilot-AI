import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Fix gemini API URL. Gemini keys starting with AQ. might be different models or the URL is just 404ing because gemini 1.5 flash has a slightly different rest path.
content = content.replace(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)
