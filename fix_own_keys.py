import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Remove the fallback to process.env.NEXT_PUBLIC_* variables
content = content.replace(
    '''        const activeOpenRouter = apiKeys.openrouter || process.env.NEXT_PUBLIC_OPENROUTER_KEY || ""
        const activeGemini = apiKeys.gemini || process.env.NEXT_PUBLIC_GEMINI_KEY || ""
        const activeOpenAI = apiKeys.openai || process.env.NEXT_PUBLIC_OPENAI_KEY || ""''',
    '''        const activeOpenRouter = apiKeys.openrouter || ""
        const activeGemini = apiKeys.gemini || ""
        const activeOpenAI = apiKeys.openai || ""'''
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)

