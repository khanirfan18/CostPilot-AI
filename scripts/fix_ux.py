import re

with open("components/costpilot/analyzer.tsx", "r") as f:
    content = f.read()

# 1. Update text area onChange to clear results
content = content.replace(
    'onChange={(e) => setAgreementText(e.target.value)}',
    'onChange={(e) => { setAgreementText(e.target.value); if (result) setResult(null); }}'
)

# 2. Update manual fields onChange to clear results
content = content.replace(
    '''                      onChange={(e) => setManualFields(prev => ({
                        ...prev,
                        [field.key]: parseFloat(e.target.value) || 0
                      }))}''',
    '''                      onChange={(e) => {
                        setManualFields(prev => ({
                          ...prev,
                          [field.key]: e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                        }));
                        if (result) setResult(null);
                      }}'''
)

# 3. Update manualFields state to allow blanks and initialize to blanks actually, wait, no, the prompt says "Reset state to initial/default values" and "Show empty clean state (no numbers)". Let's change manualFields state:
content = content.replace(
    '''  const [manualFields, setManualFields] = useState({
    principal: 100000,
    interestRate: 12,
    tenure: 12,
    processingFee: 2,
    prepaymentPenalty: 3,
    latePaymentFee: 500
  })''',
    '''  const [manualFields, setManualFields] = useState<Record<string, number | "">>({
    principal: "",
    interestRate: "",
    tenure: "",
    processingFee: "",
    prepaymentPenalty: "",
    latePaymentFee: ""
  })'''
)

# 4. Modify calculateManual to cast "" to 0
content = re.sub(
    r'const \{ (.*?) \} = manualFields',
    '''const { principal, interestRate, tenure, processingFee, prepaymentPenalty, latePaymentFee } = {
      principal: Number(manualFields.principal) || 0,
      interestRate: Number(manualFields.interestRate) || 0,
      tenure: Number(manualFields.tenure) || 0,
      processingFee: Number(manualFields.processingFee) || 0,
      prepaymentPenalty: Number(manualFields.prepaymentPenalty) || 0,
      latePaymentFee: Number(manualFields.latePaymentFee) || 0
    }''',
    content
)

# 5. Add resetAll function
reset_func = '''  const resetAll = () => {
    setAgreementText("")
    setManualFields({
      principal: "",
      interestRate: "",
      tenure: "",
      processingFee: "",
      prepaymentPenalty: "",
      latePaymentFee: ""
    })
    setResult(null)
  }

  // Keyboard shortcut'''
content = content.replace('  // Keyboard shortcut', reset_func)

# 6. Add reset button next to analyze button
analyze_button_section = '''        {/* Analyze Button */}
        <div className="flex gap-4">
          <button
            onClick={resetAll}
            disabled={isAnalyzing}
            className={`font-heading w-1/4 py-4 rounded-[14px] border border-[#27272A] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              isAnalyzing ? "text-[#71717A] cursor-not-allowed" : "text-[#71717A] hover:bg-[#1A1A25] hover:text-[#E4E4E7]"
            }`}
          >
            <span>Reset</span>
          </button>
          <button
            onClick={analyze}
            disabled={isAnalyzing}
            className={`font-heading w-3/4 py-4 rounded-[14px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              isAnalyzing
                ? "bg-[#1A1A25] text-[#71717A] cursor-not-allowed"
                : "bg-[#8B5CF6] text-[#0A0A12] hover:bg-[#8B5CF6] hover:scale-[1.02]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>{hasApiKeys ? "Analyze Agreement" : "Analyze (Demo Mode)"}</span>
              </>
            )}
          </button>
        </div>'''

# Find the analyze button section and replace
# It goes from {/* Analyze Button */} to </button> before {/* Results */}
content = re.sub(
    r'\{\/\* Analyze Button \*/\}.*?<\/button>',
    analyze_button_section,
    content,
    flags=re.DOTALL
)

with open("components/costpilot/analyzer.tsx", "w") as f:
    f.write(content)

