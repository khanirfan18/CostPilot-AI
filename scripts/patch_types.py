import re
with open("components/costpilot/analyzer.tsx", "r") as f: text = f.read()
text = re.sub(
  r'(loanAmount|actualReceived|amountInterestChargedOn|interestRate|tenure|monthlyEMI|totalPayable|totalInterest|effectiveAPR):\s*number',
  r'\1: number | string',
  text
)
with open("components/costpilot/analyzer.tsx", "w") as f: f.write(text)

with open("components/costpilot/analysis-results.tsx", "r") as f: text = f.read()
text = text.replace(
  "function formatCurrency(amount: number, symbol: string): string {",
  "function formatCurrency(amount: number | string, symbol: string): string {\n  if (typeof amount === 'string') return amount;"
)
text = text.replace(
    'value: result.loanAmount',
    "value: typeof result.loanAmount === 'number' ? result.loanAmount : 0"
)
text = text.replace(
    'value: result.totalInterest',
    "value: typeof result.totalInterest === 'number' ? result.totalInterest : 0"
)
text = text.replace(
    '${result.effectiveAPR}%',
    "${result.effectiveAPR}${typeof result.effectiveAPR === 'number' ? '%' : ''}"
)
with open("components/costpilot/analysis-results.tsx", "w") as f: f.write(text)
