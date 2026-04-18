import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    ana = f.read()

manual_replacement = """  const calculateManual = (): AnalysisResult => {
    const { principal, interestRate, tenure, processingFee, prepaymentPenalty, latePaymentFee } = manualFields
    const monthlyRate = interestRate / 12 / 100
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1)
    const totalPayable = emi * tenure
    const totalInterest = totalPayable - principal
    const processingFeeAmount = (processingFee / 100) * principal
    
    // True cash tracking
    const actualReceived = principal - processingFeeAmount
    const amountInterestChargedOn = principal
    
    // Effective APR based on actual money received
    const effectiveAPR = (((totalPayable + processingFeeAmount) - actualReceived) / actualReceived / (tenure / 12)) * 100

    const charges: Charge[] = []
    const financialTraps: string[] = []

    if (processingFee > 0) {
      charges.push({ 
        name: "Processing Fee", 
        amount: Math.round(processingFeeAmount),
        type: "UPFRONT",
        isVariable: false,
        description: `${processingFee}% deducted upfront` 
      })
      financialTraps.push(`Upfront deduction trap: Re-calculated APR is artificially increased because you don't receive the full ${currency}${principal.toLocaleString()}.`)
    }
    if (prepaymentPenalty > 0) {
      charges.push({ 
        name: "Prepayment Penalty", 
        amount: `${prepaymentPenalty}%`,
        type: "CONDITIONAL",
        isVariable: true,
        description: `${prepaymentPenalty}% of outstanding if prepaid` 
      })
      financialTraps.push(`Prepayment Lock-in: You will be penalized severely for paying your debt early.`)
    }
    if (latePaymentFee > 0) {
      charges.push({ 
        name: "Late Payment Fee", 
        amount: latePaymentFee,
        type: "CONDITIONAL",
        isVariable: true,
        description: `${currency}${latePaymentFee} per month penalty` 
      })
    }

    // Risk scoring
    const costRiskVal = effectiveAPR < 14 ? "LOW" : effectiveAPR <= 20 ? "MEDIUM" : "HIGH"
    const feeRisk = charges.length === 0 ? "LOW" : charges.length <= 1 ? "MEDIUM" : "HIGH"
    const penaltyRiskVal = prepaymentPenalty === 0 ? "LOW" : prepaymentPenalty < 4 ? "MEDIUM" : "HIGH"
    
    const riskScores = { LOW: 1, MEDIUM: 2, HIGH: 3 }
    const maxRisk = Math.max(riskScores[costRiskVal], riskScores[feeRisk], riskScores[penaltyRiskVal])
    
    let category: "FAIR" | "COSTLY" | "RISKY" | "PREDATORY" = "FAIR"
    if (maxRisk === 3 || effectiveAPR > 24) category = "PREDATORY"
    else if (maxRisk === 2 && processingFee > 0) category = "RISKY"
    else if (effectiveAPR > 15) category = "COSTLY"

    return {
      plainEnglish: `This is a ${currency}${principal.toLocaleString()} loan at ${interestRate}% annual interest for ${tenure} months. Your monthly EMI is computed based on the full balance, but after upfront reductions, you only receive ${currency}${actualReceived.toLocaleString()}.`,
      loanAmount: principal,
      actualReceived,
      amountInterestChargedOn,
      interestRate,
      tenure,
      monthlyEMI: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      effectiveAPR: parseFloat(effectiveAPR.toFixed(1)),
      charges,
      financialTraps,
      riskScores: {
        costRisk: costRiskVal,
        penaltyRisk: penaltyRiskVal,
        transparencyScore: feeRisk
      },
      verdict: {
        category,
        reasoning: `Your actual effective APR is ${effectiveAPR.toFixed(1)}%. ${category === 'PREDATORY' ? 'Severe red flags. Do not proceed unless absolutely necessary. The cost of capital is inflated.' : category === 'RISKY' ? 'Conditional penalties make this dangerous. One missed payment or early closing will trigger huge fees.' : category === 'COSTLY' ? 'Standard bank terms but definitively expensive. Ensure you comparison shop before signing.' : 'Extremely clean terms with realistic expectations. Highly recommended.'}`
      },
      amortization: generateAmortization(principal, interestRate, tenure)
    }
  }"""
ana = re.sub(r'  const calculateManual = \(\): AnalysisResult => \{.*?\n      amortization: generateAmortization\(principal, interestRate, tenure\)\n    \}\n  \}', manual_replacement, ana, flags=re.DOTALL)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(ana)
