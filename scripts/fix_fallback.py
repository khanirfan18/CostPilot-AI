import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# 1. Update push to provide 'type' and 'isVariable'
content = content.replace(
    '''      charges.push({
        name: "Processing Fee",
        amount: pfAmount,
        description: `${processingFee}% deducted upfront`
      })''',
    '''      charges.push({
        name: "Processing Fee",
        amount: pfAmount,
        type: "UPFRONT",
        isVariable: false,
        description: `${processingFee}% deducted upfront`
      })'''
)

content = content.replace(
    '''      charges.push({
        name: "Prepayment Penalty",
        amount: 0,
        description: `${prepaymentPenalty}% of outstanding if prepaid`
      })''',
    '''      charges.push({
        name: "Prepayment Penalty",
        amount: `${prepaymentPenalty}%`,
        type: "CONDITIONAL",
        isVariable: true,
        description: `${prepaymentPenalty}% of outstanding if prepaid`
      })'''
)

content = content.replace(
    '''      charges.push({
        name: "Late Payment Fee",
        amount: 0,
        description: `${currency}${latePaymentFee} per month penalty`
      })''',
    '''      charges.push({
        name: "Late Payment Fee",
        amount: latePaymentFee,
        type: "CONDITIONAL",
        isVariable: true,
        description: `${currency}${latePaymentFee} per month penalty`
      })'''
)

# 2. Fix variable references
content = content.replace('hiddenCharges.length', 'charges.length')
content = content.replace('hiddenCharges,', 'charges,')

# 3. Add actualReceived, amountInterestChargedOn
content = content.replace(
    'const totalPayable = totalInterest + loanAmount',
    'const actualReceived = loanAmount - pfAmount\n    const amountInterestChargedOn = loanAmount\n    const totalPayable = totalInterest + loanAmount + pfAmount'
)

# Insert the missing properties into the AnalysisResult return object
content = re.sub(
    r'      totalInterest,\n\s*effectiveAPR,',
    '      totalInterest,\n      effectiveAPR,\n      actualReceived,\n      amountInterestChargedOn,',
    content
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)
