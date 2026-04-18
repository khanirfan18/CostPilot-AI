import re
import os

with open('components/clarity-lens/analyzer.tsx', 'r') as f:
    analyzer = f.read()

# Replace interfaces and types
analyzer = re.sub(
    r'interface HiddenCharge \{.*?\n\}',
    '''export interface Charge {
  name: string
  amount: number | string
  type: "UPFRONT" | "FINANCED" | "RECURRING" | "CONDITIONAL"
  isVariable: boolean
  description: string
}''',
analyzer, flags=re.DOTALL)

analyzer = re.sub(
    r'interface RiskFactors \{.*?\}',
    '''export interface RiskScores {
  costRisk: "LOW" | "MEDIUM" | "HIGH"
  penaltyRisk: "LOW" | "MEDIUM" | "HIGH"
  transparencyScore: "LOW" | "MEDIUM" | "HIGH"
}

export interface Verdict {
  category: "FAIR" | "COSTLY" | "RISKY" | "PREDATORY"
  reasoning: string
}''',
analyzer, flags=re.DOTALL)

analyzer = re.sub(
    r'export interface AnalysisResult \{.*?\}',
    '''export interface AnalysisResult {
  plainEnglish: string
  loanAmount: number
  actualReceived: number
  amountInterestChargedOn: number
  interestRate: number
  tenure: number
  monthlyEMI: number
  totalPayable: number
  totalInterest: number
  effectiveAPR: number
  charges: Charge[]
  financialTraps: string[]
  riskScores: RiskScores
  verdict: Verdict
  amortization: AmortizationEntry[]
}''',
analyzer, flags=re.DOTALL)

# Replace DEMO_DATA block
new_demo = """const DEMO_DATA: AnalysisResult = {
  plainEnglish: "This is a ₹2,50,000 personal loan at 16% annual interest for 24 months. By deducting the 2.5% processing fee and adding mandatory insurance directly into the principal, the lender obscures the true cost. You are receiving significantly less money but paying interest on a larger inflated balance.",
  loanAmount: 250000,
  actualReceived: 243750,
  amountInterestChargedOn: 251200,
  interestRate: 16,
  tenure: 24,
  monthlyEMI: 12348,
  totalPayable: 296352,
  totalInterest: 45152,
  effectiveAPR: 21.4,
  charges: [
    { name: "Processing Fee", amount: 6250, type: "UPFRONT", isVariable: false, description: "2.5% deducted upfront — reduces actual disbursed cash" },
    { name: "Insurance Premium", amount: 1200, type: "FINANCED", isVariable: false, description: "Mandatory insurance added to principal, generating extra interest" },
    { name: "Legal Charges", amount: 500, type: "UPFRONT", isVariable: false, description: "One-time legal documentation fee" },
    { name: "Late Payment Penalty", amount: 750, type: "CONDITIONAL", isVariable: true, description: "Flat ₹750 charge for any delayed EMI" },
    { name: "Prepayment Penalty", amount: "4%", type: "CONDITIONAL", isVariable: true, description: "4% of outstanding principal if repaid before 12 months" }
  ],
  financialTraps: [
    "Upfront deduction trap: You are promised ₹2.5L but only receive ₹2.43L.",
    "Inflated Principal: Insurance increases the principal, making you pay interest on money you never received.",
    "Prepayment Lock-in: You are penalized heavily for paying off the loan early."
  ],
  riskScores: { costRisk: "HIGH", penaltyRisk: "HIGH", transparencyScore: "LOW" },
  verdict: {
    category: "PREDATORY",
    reasoning: "This loan utilizes classic predatory mechanics to disguise its true expense. Upfront deductions severely lower your actual cash-in-hand while financed insurance artificially inflates the interest-bearing principal. Combined with a harsh 4% prepayment trap, this agreement locks you into paying an effective rate of over 21% rather than the advertised 16%."
  },
  amortization: generateAmortization(251200, 16, 24)
}"""

analyzer = re.sub(r'const DEMO_DATA.*?\}', new_demo, analyzer, flags=re.DOTALL)

# Replace AI prompt
new_prompt = r'''const AI_PROMPT = `You are a brutally honest financial transparency analyzer. Analyze the agreement below and return ONLY valid raw JSON — no markdown, no backticks, no explanation whatsoever. Return EXACTLY this structure, making sure to calculate true costs, actual cash flow, and effective APR realistically.

RULES FOR CALCULATION:
1. loanAmount is the stated principal.
2. actualReceived = loanAmount - SUM(UPFRONT charges).
3. amountInterestChargedOn = loanAmount + SUM(FINANCED charges).
4. Re-calculate monthlyEMI based on 'amountInterestChargedOn', NOT 'loanAmount'.
5. totalPayable = (monthlyEMI * tenure) + SUM(UPFRONT charges).
6. effectiveAPR is the IRR of actual cash flows (actualReceived as negative month 0, and monthlyEMI as positive cash flows).
7. For CONDITIONAL/VARIABLE charges (e.g., late fees, prepayments), DO NOT put $0. Put the percentage or flat fee as a string like "4%" or "750" in the amount field, and set isVariable to true.

JSON STRUCTURE:
{
  "plainEnglish": "string — clear, blunt summary of the real costs",
  "loanAmount": number,
  "actualReceived": number,
  "amountInterestChargedOn": number,
  "interestRate": number,
  "tenure": number,
  "monthlyEMI": number,
  "totalPayable": number,
  "totalInterest": number,
  "effectiveAPR": number,
  "charges": [
    { 
      "name": "string",
      "amount": number | string,
      "type": "UPFRONT" | "FINANCED" | "RECURRING" | "CONDITIONAL",
      "isVariable": boolean,
      "description": "string"
    }
  ],
  "financialTraps": ["string — precise trap name/description (e.g., 'Prepayment lock-in: 5% penalty', 'Upfront deduction trap', 'Inflated principal')"],
  "riskScores": {
    "costRisk": "LOW" | "MEDIUM" | "HIGH",
    "penaltyRisk": "LOW" | "MEDIUM" | "HIGH",
    "transparencyScore": "LOW" | "MEDIUM" | "HIGH"
  },
  "verdict": {
    "category": "FAIR" | "COSTLY" | "RISKY" | "PREDATORY",
    "reasoning": "string — detailed 3-5 sentence explanation of WHY this category was chosen in a blunt, direct tone. Explicitly mention cash flow mismatches or traps."
  },
  "amortization": [{ "month": number, "emi": number, "principal": number, "interest": number, "balance": number }]
}
Agreement:
`'''

analyzer = re.sub(r'const AI_PROMPT = `.*?Agreement:\n`', new_prompt, analyzer, flags=re.DOTALL)

with open('components/clarity-lens/analyzer.tsx', 'w') as f:
    f.write(analyzer)
