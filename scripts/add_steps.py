import re

with open("components/clarity-lens/analysis-results.tsx", "r") as f:
    content = f.read()

# I will inject the Step-by-Step component right before Amortization.
new_steps = """      {/* Step-by-Step Calculations */}
      <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
        <h3 className="font-heading font-bold text-[#E4E4E7] flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span>🧮</span>
            <span>Step-by-Step Calculations</span>
          </div>
        </h3>
        
        <div className="space-y-4 font-mono text-sm">
          {/* STEP 1 */}
          <div className="bg-[#0A0A12] border border-[#1A1A25] rounded-xl p-4">
            <div className="text-xs text-[#71717A] mb-2 uppercase">Step 1 — Monthly Interest Rate</div>
            <div className="text-[#E4E4E7]">
              <div>Annual Rate      = {result.interestRate}%</div>
              <div>Monthly Rate(r)  = {result.interestRate}% ÷ 12 = {(result.interestRate / 12).toFixed(2)}% → {(result.interestRate / 1200).toFixed(6)} (decimal)</div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#0A0A12] border border-[#1A1A25] rounded-xl p-4">
            <div className="text-xs text-[#71717A] mb-2 uppercase">Step 2 — EMI Formula (Reducing Balance)</div>
            <div className="text-[#E4E4E7]">
              <div>EMI = P × r × (1 + r)^n</div>
              <div>      ─────────────────</div>
              <div>        (1 + r)^n - 1</div>
              <div className="mt-4 text-[#71717A]">Where:</div>
              <div>P = {currencySymbol}{result.loanAmount.toLocaleString()}   (Principal)</div>
              <div>r = {(result.interestRate / 1200).toFixed(6)}      (Monthly Rate)</div>
              <div>n = {result.tenure}               (Months)</div>
            </div>
          </div>

          {/* STEP 3 & 4 */}
          <div className="bg-[#0A0A12] border border-[#1A1A25] rounded-xl p-4">
            <div className="text-xs text-[#71717A] mb-2 uppercase">Step 3 & 4 — EMI Result</div>
            <div className="text-[#E4E4E7]">
              <div>EMI = {currencySymbol}{result.monthlyEMI.toLocaleString()} per month</div>
            </div>
          </div>

          {/* STEP 5 & 6 */}
          <div className="bg-[#0A0A12] border border-[#1A1A25] rounded-xl p-4">
            <div className="text-xs text-[#71717A] mb-2 uppercase">Step 5 & 6 — Total Repayment & Interest</div>
            <div className="text-[#E4E4E7]">
              <div>Total EMI Payments = {currencySymbol}{result.monthlyEMI.toLocaleString()} × {result.tenure} months</div>
              <div>                   = {currencySymbol}{(result.monthlyEMI * result.tenure).toLocaleString()}</div>
              <div className="mt-4">Total Interest     = Total EMI Payments - Principal</div>
              <div>                   = {currencySymbol}{(result.monthlyEMI * result.tenure).toLocaleString()} - {currencySymbol}{result.loanAmount.toLocaleString()}</div>
              <div>                   = {currencySymbol}{result.totalInterest.toLocaleString()}</div>
            </div>
          </div>
          
          {/* STEP 7 */}
          <div className="bg-[#0A0A12] border border-[#1A1A25] rounded-xl p-4">
            <div className="text-xs text-[#71717A] mb-2 uppercase">Step 7 — Effective APR</div>
            <div className="text-[#E4E4E7]">
              <div>Actual Cash Received = {currencySymbol}{result.actualReceived.toLocaleString()}</div>
              <div>Effective APR        = {result.effectiveAPR.toFixed(2)}% (annualized)</div>
            </div>
          </div>
        </div>
      </div>"""

content = content.replace('{/* AI Summary */}', new_steps + '\n\n      {/* AI Summary */}')

with open("components/clarity-lens/analysis-results.tsx", "w") as f:
    f.write(content)

