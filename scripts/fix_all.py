import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# Fix OpenRouter free model to the one known to work
text = text.replace(
    '"google/gemini-2.0-flash-exp:free"',
    '"google/gemini-2.0-pro-exp-02-05:free"'
)

# Fix outer catch block to properly catch the 429 that was thrown out
old_catch = r'\} catch \{\n\s*addToast\("Analysis failed", "error"\)\n\s*\} finally'
new_catch = r'''} catch (e: any) {
      if (e.message?.includes("429")) {
        addToast("API limit reached (Too many requests). Please try again in a minute.", "error")
      } else {
        addToast("Analysis failed", "error")
      }
    } finally'''

text = re.sub(old_catch, new_catch, text)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
