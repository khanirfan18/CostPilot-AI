import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

# 1. Update AI_PROMPT
prompt_regex = r'(const AI_PROMPT = `You are a brutally honest financial transparency analyzer\.)'
prompt_new = r'''const AI_PROMPT = `You are a brutally honest financial transparency analyzer. 

CRITICAL INPUT VALIDATION RULE:
If the text provided is completely random, nonsensical, or clearly NOT a financial agreement (no mention of any money formatting or loan details), return EXACTLY:
{"error": "INVALID"}

If the text looks somewhat like a financial agreement (mentions money or loans) but is missing essential details like the Principal/Loan Amount, Interest Rate, or Tenure, return EXACTLY:
{"error": "PARTIAL", "missingFields": ["list", "of", "missing", "key details"]}

Only if the agreement is reasonably complete should you proceed with the calculation.

Analyze the agreement below and return ONLY valid raw JSON — no markdown, no backticks, no explanation whatsoever. Return EXACTLY this structure, making sure to calculate true costs, actual cash flow, and effective APR realistically.'''

text = text.replace('const AI_PROMPT = `You are a brutally honest financial transparency analyzer. Analyze the agreement below and return ONLY valid raw JSON — no markdown, no backticks, no explanation whatsoever. Return EXACTLY this structure, making sure to calculate true costs, actual cash flow, and effective APR realistically.', prompt_new)


# 2. Update analyze() to check for the error JSON before setResult()
# Find setResult(analysisResult)

result_check = r'''    if (activeTab === "ai" && analysisResult) {
      const gResult = analysisResult as any;
      if (gResult.error === "INVALID") {
        addToast("Please provide valid input. We couldn't detect a financial agreement.", "error")
        setIsAnalyzing(false)
        return
      } else if (gResult.error === "PARTIAL") {
        const missing = gResult.missingFields ? gResult.missingFields.join(", ") : "key details"
        addToast(`Almost there! Please give input with this mention: ${missing}.`, "error")
        setIsAnalyzing(false)
        return
      }
    }

    setResult(analysisResult)'''

text = text.replace('    setResult(analysisResult)', result_check)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
