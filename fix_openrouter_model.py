import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Switch free model to Google's since they have higher rate limits usually
content = content.replace(
    'model: "meta-llama/llama-3.3-70b-instruct:free"',
    'model: "google/gemini-2.0-pro-exp-02-05:free"'
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)

