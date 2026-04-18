import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Wait... the gemini key `AQ...` isn't a native gemini models API key. It looks like an OpenRouter key if they sometimes change format? No, AQ... is not valid. 
# However, sometimes the model ID in Google Gemini is strictly `gemini-1.5-flash` or `gemini-pro`. Let's use `gemini-1.5-flash` because `gemini-1.5-flash-latest` might not exist either. Actually, "Not Found" 404 is specifically caused by invalid model names or invalid route.
content = content.replace(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)
