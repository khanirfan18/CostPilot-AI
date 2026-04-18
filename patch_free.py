import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# 1. State
state_regex = r'(const \[showKeys, setShowKeys\] = useState\(\{[\s\S]*?openai: false\s*\}\))'
text = re.sub(state_regex, r'\1\n  const [freeTries, setFreeTries] = useState(3)', text)

# 2. useEffect load
effect_regex = r'(// Load from localStorage on mount\s*useEffect\(\(\) => \{[\s\S]*?openai: localStorage\.getItem\("user_costpilot_openai_key"\) \|\| ""\s*\}\))'
effect_new = r'\1\n    const storedTries = localStorage.getItem("costpilot_free_tries")\n    if (storedTries !== null) {\n      setFreeTries(parseInt(storedTries, 10))\n    }'
text = re.sub(effect_regex, effect_new, text)

# 3. Analyze Logic
logic_regex = r'(if \(\!hasKeys\) \{)\s*(// Fallback if absolutely no keys manually or in env)\s*(await new Promise\(resolve => setTimeout\(resolve, 1500\)\))\s*(analysisResult = \{ \.\.\.DEMO_DATA \})\s*(addToast\("Using Static Demo Mode", "info"\))\s*(\} else \{)'

logic_new = r'''\1
      if (freeTries > 0) {
        const devOpenRouter = process.env.NEXT_PUBLIC_OPENROUTER_KEY || ""
        const devGemini = process.env.NEXT_PUBLIC_GEMINI_KEY || ""
        
        if (devOpenRouter || devGemini) {
          try {
            if (devOpenRouter) {
              analysisResult = await callOpenRouter(agreementText, devOpenRouter)
            } else {
              analysisResult = await callGemini(agreementText, devGemini)
            }
            
            const newTries = freeTries - 1
            setFreeTries(newTries)
            localStorage.setItem("costpilot_free_tries", newTries.toString())
            addToast(`Accurate Analysis Used (${newTries} free tries left). Provide your API key for unlimited access!`, "success")
          } catch (e) {
            \3
            \4
            addToast("Demo is fast but for super accurate results, use your own API key!", "info")
          }
        } else {
          \3
          \4
          addToast("Demo is fast but for super accurate results, use your own API key!", "info")
        }
      } else {
        \3
        \4
        addToast("Out of free tries! Fast demo used. Add your API key for super accurate results!", "info")
      }
    \6'''
text = re.sub(logic_regex, logic_new, text)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
