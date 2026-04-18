import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# Update OpenRouter model since the llama 3.1 8b instruct free is throwing 404
text = text.replace(
    'model: "meta-llama/llama-3.1-8b-instruct:free"',
    'model: "google/gemini-2.0-flash-exp:free"' # A very fast, commonly available free model on OpenRouter
)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
