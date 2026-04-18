import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

validation_code = r'''    if (activeTab === "ai") {
      const activeOpenRouter = apiKeys.openrouter || ""
      const activeGemini = apiKeys.gemini || ""
      const activeOpenAI = apiKeys.openai || ""
      
      if (activeOpenRouter && !activeOpenRouter.startsWith("sk-or-")) {
        addToast("Please provide the correct OpenRouter API key format (starts with sk-or-...)", "error")
        return
      }
      if (activeOpenAI && !activeOpenAI.startsWith("sk-")) {
        addToast("Please provide the correct OpenAI API key format (starts with sk-...)", "error")
        return
      }
      if (activeGemini && activeGemini.length < 30) {
        addToast("Please provide a valid Gemini API key format", "error")
        return
      }
    }

    setIsAnalyzing(true)'''

text = re.sub(r'\s*setIsAnalyzing\(true\)', '\n\n' + validation_code, text, count=1)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
