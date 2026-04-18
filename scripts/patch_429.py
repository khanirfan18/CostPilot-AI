import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# Make callGemini throw 429 explicitly
text = text.replace(
    'if (!response.ok) throw new Error("Gemini failed")',
    'if (response.status === 429) throw new Error("GEMINI_429");\n    if (!response.ok) throw new Error("Gemini failed")'
)

text = text.replace(
    'if (!response.ok) throw new Error("OpenRouter failed")',
    'if (response.status === 429) throw new Error("OPENROUTER_429");\n    if (!response.ok) throw new Error("OpenRouter failed")'
)

text = text.replace(
    'if (!response.ok) throw new Error("OpenAI failed")',
    'if (response.status === 429) throw new Error("OPENAI_429");\n    if (!response.ok) throw new Error("OpenAI failed")'
)

# Update catch blocks to handle 429 specifically
# 1. Dev keys block (free tries)
dev_catch_pattern = r'\} catch \(e\) \{\n\s*await new Promise\(resolve => setTimeout\(resolve, 1500\)\)\n\s*analysisResult = \{ \.\.\.fallbackData \}\n\s*addToast\(fallbackToast, "info"\)\n\s*\}'
dev_catch_replacement = r'''} catch (e: any) {
            if (e.message?.includes("429")) {
              setResult(null)
              setIsAnalyzing(false)
              addToast("API limit reached (Too many requests). Please try again in a minute.", "error")
              return
            }
            await new Promise(resolve => setTimeout(resolve, 1500))
            analysisResult = { ...fallbackData }
            addToast(fallbackToast, "info")
          }'''

text = re.sub(dev_catch_pattern, dev_catch_replacement, text)

# 2. Main fallback block
main_catch_pattern = r'\} catch \{\n\s*// Final fallback to static demo data\n\s*await new Promise\(resolve => setTimeout\(resolve, 500\)\)\n\s*analysisResult = \{ \.\.\.fallbackData \}\n\s*addToast\("AI failed, Using Static Demo Data", "info"\)\n\s*\}'

main_catch_replacement = r'''} catch (e: any) {
              if (e.message?.includes("429")) {
                setResult(null)
                setIsAnalyzing(false)
                addToast("API limit reached (Too many requests). Please wait a bit before trying again.", "error")
                return
              }
              // Final fallback to static demo data
              await new Promise(resolve => setTimeout(resolve, 500))
              analysisResult = { ...fallbackData }
              addToast("AI failed, Using Static Demo Data", "info")
            }'''

text = re.sub(main_catch_pattern, main_catch_replacement, text)

# Also handle the first catch in the `hasKeys` flow so it passes the error down
first_catch_pattern = r'\} catch \{\n\s*// Try fallback'
first_catch_replacement = r'} catch (e: any) {\n            if (e.message?.includes("429")) throw e;\n            // Try fallback'

text = re.sub(first_catch_pattern, first_catch_replacement, text)


with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
