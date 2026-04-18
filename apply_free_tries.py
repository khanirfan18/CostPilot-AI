import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    content = f.read()

# 1. Add freeTries state
state_old = '''    const [showKeys, setShowKeys] = useState({
      openrouter: false,
      gemini: false,
      openai: false
    })'''
state_new = '''    const [showKeys, setShowKeys] = useState({
      openrouter: false,
      gemini: false,
      openai: false
    })
    const [freeTries, setFreeTries] = useState(3)'''
content = content.replace(state_old, state_new)

# 2. Add freeTries to localStorage on mount
effect_old = '''    // Load from localStorage on mount
    useEffect(() => {
      setApiKeys({
        openrouter: localStorage.getItem("user_costpilot_openrouter_key") || "",
        gemini: localStorage.getItem("user_costpilot_gemini_key") || "",
        openai: localStorage.getItem("user_costpilot_openai_key") || ""
      })
    }, [])'''
effect_new = '''    // Load from localStorage on mount
    useEffect(() => {
      setApiKeys({
        openrouter: localStorage.getItem("user_costpilot_openrouter_key") || "",
        gemini: localStorage.getItem("user_costpilot_gemini_key") || "",
        openai: localStorage.getItem("user_costpilot_openai_key") || ""
      })
      const storedTries = localStorage.getItem("costpilot_free_tries")
      if (storedTries !== null) {
        setFreeTries(parseInt(storedTries, 10))
      }
    }, [])'''
content = content.replace(effect_old, effect_new)

# 3. Update analyze logic
fallback_old = '''          if (!hasKeys) {
            // Fallback if absolutely no keys manually or in env
            await new Promise(resolve => setTimeout(resolve, 1500))
            analysisResult = { ...DEMO_DATA }
            addToast("Using Static Demo Mode", "info")
          } else {'''
fallback_new = '''          if (!hasKeys) {
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
                  await new Promise(resolve => setTimeout(resolve, 1500))
                  analysisResult = { ...DEMO_DATA }
                  addToast("Demo is fast but for super accurate results, use your own API key!", "info")
                }
              } else {
                await new Promise(resolve => setTimeout(resolve, 1500))
                analysisResult = { ...DEMO_DATA }
                addToast("Demo is fast but for super accurate results, use your own API key!", "info")
              }
            } else {
              await new Promise(resolve => setTimeout(resolve, 1500))
              analysisResult = { ...DEMO_DATA }
              addToast("Out of free tries! Fast demo used. Add your API key for super accurate results!", "info")
            }
          } else {'''
content = content.replace(fallback_old, fallback_new)

# 4. Update the analyze button label
button_old = '''<span>{hasApiKeys ? "Analyze Agreement" : "Analyze (Demo Mode)"}</span>'''
button_new = '''<span>{hasApiKeys ? "Analyze Agreement" : (freeTries > 0 ? `Analyze (${freeTries} Free Tries)` : "Analyze (Fast Demo)")}</span>'''
content = content.replace(button_old, button_new)

# 5. Update the "Connected / None" text inside API key popup
popup_old = '''{hasApiKeys ? "Connected" : "None — Demo Mode will be used"}'''
popup_new = '''{hasApiKeys ? "Connected" : (freeTries > 0 ? `None — ${freeTries} Free Try left (Accurate)` : "None — Fast Demo will be used")}'''
content = content.replace(popup_old, popup_new)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(content)
