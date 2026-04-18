import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# remove duplicated 429 throw rules resulting from double-patch
text = text.replace(
    'if (response.status === 429) throw new Error("OPENROUTER_429");\n    if (response.status === 429) throw new Error("OPENROUTER_429");',
    'if (response.status === 429) throw new Error("OPENROUTER_429");'
)
text = text.replace(
    'if (response.status === 429) throw new Error("GEMINI_429");\n    if (response.status === 429) throw new Error("GEMINI_429");',
    'if (response.status === 429) throw new Error("GEMINI_429");'
)
text = text.replace(
    'if (response.status === 429) throw new Error("OPENAI_429");\n    if (response.status === 429) throw new Error("OPENAI_429");',
    'if (response.status === 429) throw new Error("OPENAI_429");'
)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
