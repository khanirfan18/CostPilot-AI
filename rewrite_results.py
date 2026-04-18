import re

with open('components/clarity-lens/analysis-results.tsx', 'r') as f:
    code = f.read()

# 1. Update getRiskColor function to handle POOR/FAIR/GOOD/EXCELLENT optionally, or just verify it handles LOW/MEDIUM/HIGH mapping 
# The riskLevel is gone from root, use costRisk instead for the summary
code = code.replace('result.riskLevel', 'result.riskScores.costRisk')

# 2. Update Risk Factors Bar Chart data
risk_data_old = """  const riskData = [
    { name: "Interest", value: result.riskFactors.interestStructure === "HIGH" ? 3 : result.riskFactors.interestStructure === "MEDIUM" ? 2 : 1 },
    { name: "Fees", value: result.riskFactors.feeTransparency === "HIGH" ? 3 : result.riskFactors.feeTransparency === "MEDIUM" ? 2 : 1 },
    { name: "Penalties", value: result.riskFactors.penaltyClauses === "HIGH" ? 3 : result.riskFactors.penaltyClauses === "MEDIUM" ? 2 : 1 },
  ]"""
risk_data_new = """  const riskData = [
    { name: "Cost Risk", value: result.riskScores.costRisk === "HIGH" ? 3 : result.riskScores.costRisk === "MEDIUM" ? 2 : 1 },
    { name: "Penalties", value: result.riskScores.penaltyRisk === "HIGH" ? 3 : result.riskScores.penaltyRisk === "MEDIUM" ? 2 : 1 },
    { name: "Transparency", value: result.riskScores.transparencyScore === "HIGH" ? 3 : result.riskScores.transparencyScore === "MEDIUM" ? 2 : 1 },
  ]"""
code = code.replace(risk_data_old, risk_data_new)

# 3. Update Pie Chart data to use total UPFRONT and FINANCED charges
pie_data_old = """  const costBreakdownData = [
    { name: "Principal", value: result.loanAmount },
    { name: "Interest", value: result.totalInterest },
    { name: "Hidden Charges", value: result.hiddenCharges.reduce((acc, c) => acc + c.amount, 0) },
  ]"""
pie_data_new = """  const staticCharges = result.charges.filter(c => !c.isVariable && typeof c.amount === "number") as {name: string, amount: number, type: string, description: string, isVariable: boolean}[];
  const upfrontCharges = staticCharges.filter(c => c.type === "UPFRONT").reduce((acc, c) => acc + c.amount, 0);
  const financedCharges = staticCharges.filter(c => c.type === "FINANCED").reduce((acc, c) => acc + c.amount, 0);
  const recurringCharges = staticCharges.filter(c => c.type === "RECURRING").reduce((acc, c) => acc + c.amount, 0);

  const costBreakdownData = [
    { name: "Principal", value: result.loanAmount },
    { name: "Interest", value: result.totalInterest },
    { name: "Upfront/Financed Fees", value: upfrontCharges + financedCharges },
  ]"""
code = code.replace(pie_data_old, pie_data_new)

# 4. Update the actual stats grid
stats_old = r'''        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Loan Amount
            </span>
            <span className="font-numeric text-xl font-bold text-[#E4E4E7]">
              {formatCurrency(result.loanAmount, currencySymbol)}
            </span>
          </div>'''
stats_new = r'''        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Stated Principal
            </span>
            <span className="font-numeric text-xl font-bold text-[#E4E4E7]">
              {formatCurrency(result.loanAmount, currencySymbol)}
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#EF4444]/20">
            <span className="text-xs text-[#EF4444] uppercase tracking-wider block mb-1">
              You Actually Receive
            </span>
            <span className="font-numeric text-xl font-bold text-[#EF4444]">
              {formatCurrency(result.actualReceived, currencySymbol)}
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#EAB308]/20">
            <span className="text-xs text-[#EAB308] uppercase tracking-wider block mb-1">
              Interest Charged On
            </span>
            <span className="font-numeric text-xl font-bold text-[#EAB308]">
              {formatCurrency(result.amountInterestChargedOn, currencySymbol)}
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Total Payable
            </span>
            <span className="font-numeric text-xl font-bold text-[#E4E4E7]">
              {formatCurrency(result.totalPayable, currencySymbol)}
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Stated Rate
            </span>
            <span className="font-numeric text-xl font-bold text-[#E4E4E7]">
              {result.interestRate}%
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Effective APR
            </span>
            <span className="font-numeric text-xl font-bold text-[#8B5CF6]">
              {result.effectiveAPR}%
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Tenure
            </span>
            <span className="font-numeric text-xl font-bold text-[#E4E4E7]">
              {result.tenure} mo
            </span>
          </div>
          <div className="p-4 bg-[#1A1A25] rounded-xl border border-[#27272A]">
            <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">
              Monthly EMI
            </span>
            <span className="font-numeric text-xl font-bold text-[#E4E4E7]">
              {formatCurrency(result.monthlyEMI, currencySymbol)}
            </span>
          </div>
        </div>'''
code = re.sub(r'        \{\/\* Key Stats \*\/\}.*?<div className="grid md:grid-cols-2 gap-6 mt-6">', stats_new + '\n\n        <div className="grid md:grid-cols-2 gap-6 mt-6">', code, flags=re.DOTALL)

# 5. Update Hidden Charges to All Charges
hidden_charges_old = r'''              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-[#EAB308]" />
                <h3 className="font-heading font-bold text-lg text-[#E4E4E7]">Detected Hidden Charges</h3>
              </div>
              <div className="space-y-4">
                {result.hiddenCharges.map((charge, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-[#27272A] bg-[#1A1A25] flex justify-between items-start group hover:border-[#EAB308]/50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-[#E4E4E7] text-sm">{charge.name}</p>
                      <p className="text-xs text-[#71717A] mt-1">{charge.description}</p>
                    </div>
                    <span className="font-numeric font-bold text-[#E4E4E7] whitespace-nowrap ml-4">
                      {formatCurrency(charge.amount, currencySymbol)}
                    </span>
                  </div>
                ))}
                {result.hiddenCharges.length === 0 && (
                  <div className="text-center p-8 border border-dashed border-[#27272A] rounded-xl">
                    <CheckCircle className="w-8 h-8 text-[#22C55E] mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-[#71717A]">No hidden charges detected</p>
                  </div>
                )}
              </div>'''
hidden_charges_new = r'''              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-[#EAB308]" />
                <h3 className="font-heading font-bold text-lg text-[#E4E4E7]">Categorized Charges & Fees</h3>
              </div>
              <div className="space-y-4">
                {result.charges.map((charge, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-[#27272A] bg-[#1A1A25] flex justify-between items-start group hover:border-[#EAB308]/50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-[#E4E4E7] text-sm flex items-center gap-2">
                        {charge.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          charge.type === 'UPFRONT' ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' :
                          charge.type === 'FINANCED' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20' :
                          charge.type === 'CONDITIONAL' ? 'bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20' :
                          'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                        }`}>
                          {charge.type} {charge.isVariable && '(Variable)'}
                        </span>
                      </p>
                      <p className="text-xs text-[#71717A] mt-1">{charge.description}</p>
                    </div>
                    <span className="font-numeric font-bold text-[#E4E4E7] whitespace-nowrap ml-4">
                      {charge.isVariable ? charge.amount : formatCurrency(Number(charge.amount), currencySymbol)}
                    </span>
                  </div>
                ))}
                {result.charges.length === 0 && (
                  <div className="text-center p-8 border border-dashed border-[#27272A] rounded-xl">
                    <CheckCircle className="w-8 h-8 text-[#22C55E] mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-[#71717A]">No additional charges detected</p>
                  </div>
                )}
              </div>'''
code = code.replace(hidden_charges_old, hidden_charges_new)


# 6. Update Real Talk Verdict completely
verdict_old = r'''        {/* Real Talk Verdict Component */}
        <div className="mt-8 border border-[#27272A] rounded-2xl bg-[#1A1A25] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 to-[#22D3EE]/5 opacity-10 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="p-6 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            
            {/* The Badge/Icon area */}
            <div className="flex-shrink-0 flex items-center justify-center p-4 rounded-xl bg-[#0A0A12] border border-[#27272A]">
              {result.riskLevel === "HIGH" ? (
                <div className="text-4xl">🚩</div>
              ) : result.riskLevel === "MEDIUM" ? (
                <div className="text-4xl">😬</div>
              ) : (
                <div className="text-4xl">💅</div>
              )}
            </div>

            {/* Conclusion text */}
            <div className="flex-grow">
              <h3 className="font-heading text-lg font-bold text-[#E4E4E7] mb-2">
                Real Talk Verdict
              </h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                {result.riskLevel === "HIGH" 
                  ? "Big yikes bestie. This agreement is full of red flags. Between the massive hidden fees and sneaky compounding structures, you're getting absolutely cooked. Hard pass unless you have literally zero other options."
                  : result.riskLevel === "MEDIUM"
                  ? "It's giving mid vibes. The core terms are okay, but there are some sneaky penalties or fees buried in there. Proceed with caution and don't miss any payments, or it'll cost you."
                  : "Huge W! The structure is surprisingly clean, clear, and fair. No crazy hidden charges, and the math actually maths. This is a solid agreement."}
              </p>
            </div>
            
          </div>
        </div>'''

verdict_new = r'''        {/* Financial Traps Component */}
        {result.financialTraps && result.financialTraps.length > 0 && (
          <div className="mt-6 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-2xl p-6">
            <h3 className="font-heading font-bold text-[#EF4444] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Financial Traps Detected
            </h3>
            <ul className="space-y-3">
              {result.financialTraps.map((trap, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#EF4444] mt-0.5">•</span>
                  <span className="text-sm text-[#E4E4E7]/90 leading-relaxed">{trap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Verdict Component */}
        <div className="mt-6 border border-[#27272A] rounded-2xl bg-[#1A1A25] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 to-[#22D3EE]/5 opacity-10 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="p-6 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-xl bg-[#0A0A12] border border-[#27272A] min-w-[120px]">
              {result.verdict.category === "PREDATORY" ? (
                 <AlertTriangle className="w-8 h-8 text-[#EF4444] mb-2" />
              ) : result.verdict.category === "RISKY" ? (
                 <AlertTriangle className="w-8 h-8 text-[#f97316] mb-2" />
              ) : result.verdict.category === "COSTLY" ? (
                 <AlertTriangle className="w-8 h-8 text-[#EAB308] mb-2" />
              ) : (
                 <CheckCircle className="w-8 h-8 text-[#22C55E] mb-2" />
              )}
              <span className={`text-xs font-bold tracking-widest uppercase ${
                result.verdict.category === "PREDATORY" ? "text-[#EF4444]" :
                result.verdict.category === "RISKY" ? "text-[#f97316]" :
                result.verdict.category === "COSTLY" ? "text-[#EAB308]" :
                "text-[#22C55E]"
              }`}>
                {result.verdict.category}
              </span>
            </div>

            <div className="flex-grow">
              <h3 className="font-heading text-lg font-bold text-[#E4E4E7] mb-2">
                Advisor Verdict
              </h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                {result.verdict.reasoning}
              </p>
            </div>
          </div>
        </div>'''
code = code.replace(verdict_old, verdict_new)

# 7. Print plain text output copy export to reflect new values
copy_text_old = r'''    const text = `CostPilot AI Audit Report
---------------------------
Principal: ${formatCurrency(result.loanAmount, currencySymbol)}
Interest Rate: ${result.interestRate}%
Tenure: ${result.tenure} months
Monthly EMI: ${formatCurrency(result.monthlyEMI, currencySymbol)}

Total Payable: ${formatCurrency(result.totalPayable, currencySymbol)}
Total Interest: ${formatCurrency(result.totalInterest, currencySymbol)}
Effective APR: ${result.effectiveAPR}%

Summary: ${result.plainEnglish}
`'''
copy_text_new = r'''    const text = `CostPilot AI Audit Report
---------------------------
Stated Principal: ${formatCurrency(result.loanAmount, currencySymbol)}
Actual Cash Received: ${formatCurrency(result.actualReceived, currencySymbol)}
Amount Interest is Charged On: ${formatCurrency(result.amountInterestChargedOn, currencySymbol)}
Interest Rate: ${result.interestRate}%
Tenure: ${result.tenure} months
Monthly EMI: ${formatCurrency(result.monthlyEMI, currencySymbol)}

Total Payable: ${formatCurrency(result.totalPayable, currencySymbol)}
Total Interest: ${formatCurrency(result.totalInterest, currencySymbol)}
Effective APR: ${result.effectiveAPR}%

Verdict (${result.verdict.category}):
${result.verdict.reasoning}
`'''
code = code.replace(copy_text_old, copy_text_new)

with open('components/clarity-lens/analysis-results.tsx', 'w') as f:
    f.write(code)

