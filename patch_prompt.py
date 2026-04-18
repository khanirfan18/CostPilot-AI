import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    text = f.read()

new_rules = """RULES FOR CALCULATION & PARSING:
1. FLEXIBLE PARSING: Handle messy, unstructured text. Extract loan details even if loosely worded (e.g. "I think 10%", "around 50k", "used/withdrawn/limit" for credit lines).
2. loanAmount is the stated principal or utilized credit line.
3. actualReceived = loanAmount - SUM(UPFRONT charges).
4. amountInterestChargedOn = loanAmount + SUM(FINANCED charges).
5. Re-calculate monthlyEMI based on 'amountInterestChargedOn', NOT 'loanAmount'.
6. totalPayable = (monthlyEMI * tenure) + SUM(UPFRONT charges).
7. effectiveAPR is the IRR of actual cash flows (actualReceived as negative month 0, and monthlyEMI as positive cash flows).
8. For CONDITIONAL/VARIABLE charges (e.g., late fees, prepayments, subscriptions, processing, documentation), DO NOT put $0. Put the percentage or flat fee as a string like "4%" or "750" in the amount field, and set isVariable to true. Look aggressively for ANY fees.
9. ZERO-INTEREST CHECK: If the input explicitly mentions "0%" or "no-cost EMI", you must NOT assume it is genuinely free. Check thoroughly for processing fees, platform fees, or convenience charges. Treat these fees as the effective interest to calculate realistic effectiveAPR and add this exact insight into financialTraps: "Although interest is 0%, fees increase the actual cost."
10. UNCERTAINTY & SAFE FALLBACK: If values are vague or approximations (e.g. "~14-15%"), estimate realistically and reflect this in 'plainEnglish' (e.g. "~14-15% estimated interest"). 
11. MISSING INFO FALLBACK: If the text is fundamentally a loan/financial product but completely lacks precise numbers to calculate an amortization schedule, do NOT return an error. Switch to "insight mode": return strings like "Not applicable", "Variable", or "Estimated range" for the missing strictly-numeric fields (loanAmount, interestRate, monthlyEMI, expectedAPR, etc.), and provide structural insights in 'plainEnglish' and 'financialTraps'.

STRUCTURE DETECTION:
Implicitly detect standard loans, credit lines, and hybrid products. Address this in the 'plainEnglish' context if it impacts repayment (e.g. "This appears to be a revolving credit line...")."""

new_json_structure = """JSON STRUCTURE:
{
  "plainEnglish": "string — clear, blunt summary of the real costs, including detection of standard loan, credit line, or hybrid product",
  "loanAmount": number | string,
  "actualReceived": number | string,
  "amountInterestChargedOn": number | string,
  "interestRate": number | string,
  "tenure": number | string,
  "monthlyEMI": number | string,
  "totalPayable": number | string,
  "totalInterest": number | string,
  "effectiveAPR": number | string,
  "charges": [
    { 
      "name": "string",
      "amount": number | string,
      "type": "UPFRONT" | "FINANCED" | "RECURRING" | "CONDITIONAL",
      "isVariable": boolean,
      "description": "string"
    }
  ],
  "financialTraps": ["string — precise trap name/description"],
  "riskScores": {
    "costRisk": "LOW" | "MEDIUM" | "HIGH",
    "penaltyRisk": "LOW" | "MEDIUM" | "HIGH",
    "transparencyScore": "LOW" | "MEDIUM" | "HIGH"
  },
  "verdict": {
    "category": "COMPLEX" | "FAIR" | "COSTLY" | "RISKY" | "PREDATORY",
    "reasoning": "string — detailed 3-5 sentence explanation of WHY this category was chosen in a blunt, direct tone."
  },
  "amortization": [{ "month": number, "emi": number, "principal": number, "interest": number, "balance": number }]
}"""

# Use regex to replace the rules and json structure
pattern = r"RULES FOR CALCULATION:(.*?)JSON STRUCTURE:(.*?)Agreement:"
replacement = new_rules + "\n\n" + new_json_structure + "\nAgreement:"

text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(text)
