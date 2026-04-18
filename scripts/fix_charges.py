with open("components/clarity-lens/analysis-results.tsx", "r") as f:
    content = f.read()

# 1. costBreakdownData 
# Line 60: { name: "Hidden Charges", value: result.hiddenCharges.reduce((sum, c) => sum + c.amount, 0) },
content = content.replace(
    'value: result.hiddenCharges.reduce((sum, c) => sum + c.amount, 0),',
    'value: result.charges.reduce((sum, c) => sum + (c.isVariable ? 0 : Number(c.amount)), 0),'
)
content = content.replace('{ name: "Hidden Charges"', '{ name: "Additional Fees"')

# 2. text generator report
# Line 93: ${result.hiddenCharges.map((c) => `- ${c.name}: ${formatCurrency(c.amount, currencySymbol)}`).join("\\n")}
content = content.replace(
    '${result.hiddenCharges.map((c) => `- ${c.name}: ${formatCurrency(c.amount, currencySymbol)}`).join("\\n")}',
    '${result.charges.map((c) => `- ${c.name}: ${c.isVariable ? c.amount : formatCurrency(Number(c.amount), currencySymbol)}`).join("\\n")}'
)
content = content.replace('Hidden Charges Detectected:', 'Additional Fees & Charges:')
content = content.replace('Hidden Charges Detected:', 'Additional Fees & Charges:')
content = content.replace('hiddenCharges', 'charges')

# Also fix the recharts Tooltip syntax error where it expects a specific ReactNode return for formatter
content = content.replace(
    'formatter={(value: number) =>',
    'formatter={(value: number): [string, string] =>'
)

# And one inside the AreaChart tooltip
content = content.replace(
    'formatter={(value: number, name: string) =>',
    'formatter={(value: number, name: string): [string, string] =>'
)

with open("components/clarity-lens/analysis-results.tsx", "w") as f:
    f.write(content)
