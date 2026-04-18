import re

with open("components/clarity-lens/analysis-results.tsx", "r") as f:
    res = f.read()

# Fix 1: Formatter
res = res.replace(
    'formatter={(value: number): [string, string] => {formatCurrency(value, currencySymbol)}}',
    'formatter={(value: number, name: string): [string, string] => [formatCurrency(value, currencySymbol), name]}'
)

# Fix 2: amount > 0
res = re.sub(
    r'<span className="font-heading text-\[\#EAB308\] font-bold tabular-nums">\{charge\.amount > 0 \? formatCurrency\(charge\.amount, currencySymbol\) : "Variable"\}',
    r'<span className="font-heading text-[#EAB308] font-bold tabular-nums">{!charge.isVariable ? formatCurrency(Number(charge.amount), currencySymbol) : charge.amount}',
    res
)

# Fix 3: riskFactors at bottom
old_factors = '''            { label: "Interest Structure", value: result.riskFactors.interestStructure },
            { label: "Fee Transparency", value: result.riskFactors.feeTransparency },
            { label: "Penalty Clauses", value: result.riskFactors.penaltyClauses },'''

new_factors = '''            { label: "Cost Risk", value: result.riskScores.costRisk },
            { label: "Penalty Risk", value: result.riskScores.penaltyRisk },
            { label: "Transparency Score", value: result.riskScores.transparencyScore },'''

res = res.replace(old_factors, new_factors)

with open("components/clarity-lens/analysis-results.tsx", "w") as f:
    f.write(res)

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    ana = f.read()

# Fix 4: fallback analyzer still uses HiddenCharge
ana = ana.replace('const hiddenCharges: HiddenCharge[] = []', 'const charges: Charge[] = []')
ana = ana.replace('hiddenCharges.push({', 'charges.push({')
ana = re.sub(r'hiddenCharges,\n\s*riskLevel: \"MEDIUM\",\n\s*riskFactors: \{.*?\},', '''charges,
      financialTraps: ["Fallback analysis generated. Values are estimates.", "Actual exact deductions may vary based on fine print."],
      riskScores: { costRisk: "MEDIUM", penaltyRisk: "MEDIUM", transparencyScore: "MEDIUM" },
      verdict: { category: "RISKY", reasoning: "This is a fallback generated analysis. Please use Demo Mode or configure an AI agent for a real assessment of the document's complex terms and conditions." },''', ana, flags=re.DOTALL)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(ana)
