import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

validation_code = r'''      // Validate API key formats
      if (activeTab === "ai") {
        const activeOpenRouter = apiKeys.openrouter || ""
        const activeGemini = apiKeys.gemini || ""
        const activeOpenAI = apiKeys.openai || ""
        
        if (activeOpenRouter && !activeOpenRouter.startsWith("sk-or-")) {
          addToast("Please provide the correct format for OpenRouter key (e.g. sk-or-...)", "error")
          return
        }
        if (activeOpenAI && !activeOpenAI.startsWith("sk-") && !activeOpenAI.startsWith("sk-proj-")) {
          addToast("Please provide the correct format for OpenAI key (e.g. sk-...)", "error")
          return
        }
        if (activeGemini && activeGemini.length < 30) {
          addToast("Please provide the correct format for Gemini API key.", "error")
          return
        }
      }

      setIsAnalyzing(true)'''

logic_regex = r'(\s*setIsAnalyzing\(true\))'

text = text.replace('      setIsAnalyzing(true)', validation_code)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
