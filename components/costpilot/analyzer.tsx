"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Eye, EyeOff, Copy, FileText, ExternalLink, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { AnalysisResults } from "./analysis-results"
import { ToastContainer, useToast } from "./toast"

// Types
export interface Charge {
  name: string
  amount: number | string
  type: "UPFRONT" | "FINANCED" | "RECURRING" | "CONDITIONAL"
  isVariable: boolean
  description: string
}

export interface RiskScores {
  costRisk: "LOW" | "MEDIUM" | "HIGH"
  penaltyRisk: "LOW" | "MEDIUM" | "HIGH"
  transparencyScore: "LOW" | "MEDIUM" | "HIGH"
}

export interface Verdict {
  category: "FAIR" | "COSTLY" | "RISKY" | "PREDATORY"
  reasoning: string
}

interface AmortizationEntry {
  month: number
  emi: number
  principal: number
  interest: number
  balance: number
}

export interface AnalysisResult {
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
}



const EXAMPLE_TEXT = `Personal Loan Agreement
Loan Amount: ₹2,50,000
Interest Rate: 16% per annum, compounded monthly
Tenure: 24 months
Processing Fee: 2.5% of loan amount (deducted upfront)
Prepayment Charges: 4% of outstanding principal if paid before 12 months
Late Payment Penalty: ₹750 per month
Insurance Premium: ₹1,200 (mandatory, added to principal)
Legal Charges: ₹500 (one-time)`

const DEMO_DATA: AnalysisResult = {
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
}

function generateAmortization(principal: number, annualRate: number, months: number): AmortizationEntry[] {
  const monthlyRate = annualRate / 12 / 100
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
  
  const schedule: AmortizationEntry[] = []
  let balance = principal
  
  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate
    const principalPart = emi - interest
    balance = Math.max(0, balance - principalPart)
    
    schedule.push({
      month,
      emi: Math.round(emi),
      principal: Math.round(principalPart),
      interest: Math.round(interest),
      balance: Math.round(balance)
    })
  }
  
  return schedule
}

const AI_PROMPT = `You are a brutally honest financial transparency analyzer. Analyze the agreement below and return ONLY valid raw JSON — no markdown, no backticks, no explanation whatsoever. Return EXACTLY this structure, making sure to calculate true costs, actual cash flow, and effective APR realistically.

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
`


const LOADING_MESSAGES = [
  "Hang tight, analyzing your loan... ⏳",
  "Detecting hidden charges... 🕵️",
  "Calculating true cost... 💸",
  "Uncovering sneaky fees... 👀",
  "Almost done... polishing results ✨"
];

const PROGRESS_STEPS = [
  "Parsing input",
  "Calculating EMI",
  "Detecting hidden charges",
  "Generating insights"
];

function AnalyzerLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    const stepInterval = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="w-full bg-[#12121A] border border-[#1A1A25] rounded-2xl p-8 mt-8 flex flex-col items-center justify-center animate-in fade-in fade-out duration-500 min-h-[350px]">
      <div className="relative mb-6 w-16 h-16 flex items-center justify-center">
        <div className="text-5xl animate-bounce absolute">💸</div>
        <div className="text-3xl animate-pulse absolute -right-4 -bottom-2">🧠</div>
      </div>
      
      <h3 className="font-heading text-xl font-bold text-[#E4E4E7] mb-8 text-center transition-all duration-300">
        {LOADING_MESSAGES[messageIndex]}
      </h3>

      <div className="w-full max-w-md space-y-3">
        {PROGRESS_STEPS.map((step, idx) => {
          const isActive = idx === stepIndex;
          const isCompleted = idx < stepIndex;
          
          return (
            <div 
              key={step} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                isActive ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#E4E4E7]" : 
                isCompleted ? "bg-[#22C55E]/5 border-[#22C55E]/20 text-[#71717A]" : 
                "bg-[#0A0A12] border-[#1A1A25] text-[#404040]"
              }`}
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {isCompleted ? (
                  <span className="text-[#22C55E]">✔</span>
                ) : isActive ? (
                  <span className="text-[#8B5CF6] inline-block animate-spin">⏳</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#404040]"></span>
                )}
              </div>
              <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Analyzer() {
  const { ref, isVisible } = useInView()
  const { toasts, addToast, removeToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai")
  const [currency, setCurrency] = useState("₹")
  const [agreementText, setAgreementText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  
  // Manual entry fields
  const [manualFields, setManualFields] = useState<Record<string, number | "">>({
    principal: "",
    interestRate: "",
    tenure: "",
    processingFee: "",
    prepaymentPenalty: "",
    latePaymentFee: ""
  })
  
  // API Keys
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState({
    openrouter: "",
    gemini: "",
    openai: ""
  })
  const [showKeys, setShowKeys] = useState({
    openrouter: false,
    gemini: false,
    openai: false
  })

  // Load from localStorage on mount
  useEffect(() => {
    setApiKeys({
      openrouter: localStorage.getItem("user_costpilot_openrouter_key") || "",
      gemini: localStorage.getItem("user_costpilot_gemini_key") || "",
      openai: localStorage.getItem("user_costpilot_openai_key") || ""
    })
  }, [])

  // Save API keys to localStorage when they change
  useEffect(() => {
    if (apiKeys.openrouter) {
      localStorage.setItem("user_costpilot_openrouter_key", apiKeys.openrouter)
    } else {
      localStorage.removeItem("user_costpilot_openrouter_key")
    }
    
    if (apiKeys.gemini) {
      localStorage.setItem("user_costpilot_gemini_key", apiKeys.gemini)
    } else {
      localStorage.removeItem("user_costpilot_gemini_key")
    }
    
    if (apiKeys.openai) {
      localStorage.setItem("user_costpilot_openai_key", apiKeys.openai)
    } else {
      localStorage.removeItem("user_costpilot_openai_key")
    }
  }, [apiKeys])



  const callOpenRouter = async (text: string, key: string): Promise<AnalysisResult> => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": window.location.href,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "user", content: AI_PROMPT + text }]
      })
    })
    
    if (!response.ok) throw new Error("OpenRouter failed")
    const data = await response.json()
    const content = data.choices[0].message.content
    return parseAIResponse(content)
  }

  const callGemini = async (text: string, key: string): Promise<AnalysisResult> => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: AI_PROMPT + text }] }]
      })
    })
    
    if (!response.ok) throw new Error("Gemini failed")
    const data = await response.json()
    const content = data.candidates[0].content.parts[0].text
    return parseAIResponse(content)
  }

  const callOpenAI = async (text: string, key: string): Promise<AnalysisResult> => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: AI_PROMPT + text }]
      })
    })
    
    if (!response.ok) throw new Error("OpenAI failed")
    const data = await response.json()
    const content = data.choices[0].message.content
    return parseAIResponse(content)
  }

  const parseAIResponse = (content: string): AnalysisResult => {
    // Strip markdown code blocks if present
    let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()
    return JSON.parse(cleaned)
  }

  const analyze = async () => {
    if (activeTab === "ai" && !agreementText.trim()) {
      addToast("Please enter an agreement to analyze", "error")
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      let analysisResult: AnalysisResult

      if (activeTab === "manual") {
        // Manual calculation
        analysisResult = calculateManual()
        addToast("Analysis complete!", "success")
      } else {
        // AI Analysis with fallback chain
        const activeOpenRouter = apiKeys.openrouter || ""
        const activeGemini = apiKeys.gemini || ""
        const activeOpenAI = apiKeys.openai || ""
        
        const hasKeys = activeOpenRouter || activeGemini || activeOpenAI
        
        if (!hasKeys) {
          // Fallback if absolutely no keys manually or in env
          await new Promise(resolve => setTimeout(resolve, 1500))
          analysisResult = { ...DEMO_DATA }
          addToast("Using Static Demo Mode", "info")
        } else {
          try {
            if (activeOpenRouter) {
              analysisResult = await callOpenRouter(agreementText, activeOpenRouter)
              addToast("Analysis complete!", "success")
            } else if (activeGemini) {
              analysisResult = await callGemini(agreementText, activeGemini)
              addToast("Analysis complete!", "success")
            } else if (activeOpenAI) {
              analysisResult = await callOpenAI(agreementText, activeOpenAI)
              addToast("Analysis complete!", "success")
            } else {
              throw new Error("No API keys")
            }
          } catch {
            // Try fallback
            try {
              if (activeGemini && !activeOpenRouter) {
                analysisResult = await callGemini(agreementText, activeGemini)
                addToast("Analysis complete!", "success")
              } else if (activeOpenAI) {
                analysisResult = await callOpenAI(agreementText, activeOpenAI)
                addToast("Analysis complete!", "success")
              } else {
                throw new Error("All APIs failed")
              }
            } catch {
              // Final fallback to static demo data
              await new Promise(resolve => setTimeout(resolve, 500))
              analysisResult = { ...DEMO_DATA }
              addToast("AI failed, Using Static Demo Data", "info")
            }
          }
        }
      }

      setResult(analysisResult)
    } catch {
      addToast("Analysis failed", "error")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateManual = (): AnalysisResult => {
    const { principal, interestRate, tenure, processingFee, prepaymentPenalty, latePaymentFee } = {
      principal: Number(manualFields.principal) || 0,
      interestRate: Number(manualFields.interestRate) || 0,
      tenure: Number(manualFields.tenure) || 0,
      processingFee: Number(manualFields.processingFee) || 0,
      prepaymentPenalty: Number(manualFields.prepaymentPenalty) || 0,
      latePaymentFee: Number(manualFields.latePaymentFee) || 0
    }
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
  }

  const resetAll = () => {
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

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        analyze()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [agreementText, activeTab, manualFields, apiKeys])

  const hasApiKeys = apiKeys.openrouter || apiKeys.gemini || apiKeys.openai

  return (
    <section
      id="analyzer"
      ref={ref}
      className={`py-24 px-4 fade-in-section ${isVisible ? "visible" : ""}`}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-[#8B5CF6] text-xs font-medium uppercase tracking-widest">
            LIVE TOOL
          </span>
          <h2 className="font-heading mt-4 text-3xl sm:text-4xl font-black">
            <span className="text-[#E4E4E7]">Try </span>
            <span className="text-[#8B5CF6]">CostPilot AI</span>
          </h2>
        </div>

        {/* Tab Switcher and Currency Selector */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="bg-[#12121A] rounded-2xl p-1 flex flex-1">
            <button
              onClick={() => setActiveTab("ai")}
              className={`font-heading flex-1 py-4 px-6 rounded-xl transition-all duration-200 ${
                activeTab === "ai"
                  ? "bg-[#8B5CF6] text-[#0A0A12] font-bold"
                  : "text-[#71717A] hover:text-[#E4E4E7]"
              }`}
            >
              <div className="flex flex-col items-center">
                <span>🤖 AI Analysis</span>
                <span className="text-xs mt-1 opacity-70">Paste raw text</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`font-heading flex-1 py-4 px-6 rounded-xl transition-all duration-200 ${
                activeTab === "manual"
                  ? "bg-[#8B5CF6] text-[#0A0A12] font-bold"
                  : "text-[#71717A] hover:text-[#E4E4E7]"
              }`}
            >
              <div className="flex flex-col items-center">
                <span>✏️ Manual Entry</span>
                <span className="text-xs mt-1 opacity-70">Enter numbers</span>
              </div>
            </button>
          </div>
          
          {/* Currency Selector */}
          <div className="bg-[#12121A] rounded-2xl p-1 flex shrink-0">
            <div className="flex h-full w-full">
              {[
                { symbol: "₹", label: "INR" },
                { symbol: "$", label: "USD" },
                { symbol: "€", label: "EUR" },
                { symbol: "£", label: "GBP" },
              ].map((cur) => (
                <button
                  key={cur.symbol}
                  onClick={() => setCurrency(cur.symbol)}
                  className={`font-heading py-2 px-4 rounded-xl flex-1 sm:flex-none sm:w-16 transition-all duration-200 flex flex-col items-center justify-center ${
                    currency === cur.symbol
                      ? "bg-[#1A1A25] text-[#E4E4E7] font-bold"
                      : "text-[#71717A] hover:text-[#E4E4E7]"
                  }`}
                >
                  <span className="font-heading text-lg leading-none">{cur.symbol}</span>
                  <span className="text-[10px] mt-1 opacity-70">{cur.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Tab */}
        {activeTab === "ai" && (
          <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[#E4E4E7] flex items-center gap-2">
                🔍 AI Financial Analyzer
              </h3>
              <button
                onClick={() => { if (agreementText) { setAgreementText(""); if (result) setResult(null); } else { setAgreementText(EXAMPLE_TEXT); } }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#8B5CF6] text-[#8B5CF6] text-sm hover:bg-[#8B5CF6]/10 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {agreementText ? "Clear Editor" : "Try Example"}
              </button>
            </div>

                        <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-2">
              PASTE FINANCIAL AGREEMENT
            </label>
            <textarea
              value={agreementText}
              onChange={(e) => { setAgreementText(e.target.value); if (result) setResult(null); }}
              placeholder="Paste your loan agreement here..."
              className="w-full min-h-[200px] bg-[#0A0A12] border border-[#27272A] rounded-xl p-4 text-[#d1d5db] font-mono text-sm focus:border-[#8B5CF6] focus:outline-none resize-y transition-colors"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-[#71717A]">
              <span>Supports any format</span>
              <span>{agreementText.length} characters</span>
            </div>
          </div>
        )}

        {/* Manual Entry Tab */}
        {activeTab === "manual" && (
          <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6 mb-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "principal", label: "PRINCIPAL AMOUNT", prefix: currency, helper: "Total loan amount" },
                { key: "interestRate", label: "ANNUAL INTEREST RATE", suffix: "%", helper: "% per annum, compounded monthly" },
                { key: "tenure", label: "TENURE", suffix: "months", helper: "Number of months" },
                { key: "processingFee", label: "PROCESSING FEE", suffix: "%", helper: "% of principal (optional)" },
                { key: "prepaymentPenalty", label: "PREPAYMENT PENALTY", suffix: "%", helper: "% of outstanding (optional)" },
                { key: "latePaymentFee", label: "LATE PAYMENT FEE", prefix: currency, helper: "per month (optional)" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    {field.prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                        {field.prefix}
                      </span>
                    )}
                    <input
                      type="number"
                      value={manualFields[field.key as keyof typeof manualFields]}
                      onChange={(e) => {
                        setManualFields(prev => ({
                          ...prev,
                          [field.key]: e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                        }));
                        if (result) setResult(null);
                      }}
                      className={`w-full bg-[#0A0A12] border border-[#27272A] rounded-xl p-3 text-[#E4E4E7] focus:border-[#8B5CF6] focus:outline-none transition-colors ${
                        field.prefix ? "pl-8" : ""
                      } ${field.suffix ? "pr-16" : ""}`}
                    />
                    {field.suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm">
                        {field.suffix}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#71717A] mt-1 block">{field.helper}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Keys Section */}
        <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl mb-6 overflow-hidden">
          <div
            onClick={() => setIsApiKeysOpen(!isApiKeysOpen)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1A25] transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-heading font-bold text-[#E4E4E7] flex items-center gap-2">🔑 API Keys</h3>
              <span className="text-xs text-[#71717A]">
                {hasApiKeys ? "Connected" : "None — Demo Mode will be used"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {hasApiKeys ? (
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  Live
                </span>
              ) : (
                <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#EAB308]/50 bg-[#EAB308]/10 text-[#EAB308] text-xs font-medium">
                  ⚡ Demo Mode
                </span>
              )}
              {isApiKeysOpen ? (
                <ChevronUp className="w-4 h-4 text-[#71717A]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#71717A]" />
              )}
            </div>
          </div>

          {isApiKeysOpen && (
            <div className="p-6 border-t border-[#1A1A25]">
              <p className="text-sm text-[#71717A] mb-6">
                Add keys For real AI analysis. Priority: Google Gemini → OpenRouter → OpenAI. If none are provided, Demo Mode activates automatically — no crash, no error.
              </p>

              <div className="space-y-4">
                {/* Gemini */}
                <div className="border border-[#1A1A25] rounded-xl p-4 bg-[#0A0A12]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B5CF6]">✦</span>
                      <span className="font-heading font-bold text-[#E4E4E7]">Google Gemini</span>
                      <span className="text-xs text-[#71717A] ml-2">Free tier · gemini-1.5-flash</span>
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B5CF6] text-xs flex items-center gap-1 hover:underline"
                    >
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys.gemini ? "text" : "password"}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                      placeholder="AIza..."
                      className="w-full bg-[#12121A] border border-[#1A1A25] rounded-xl p-3 pr-10 text-[#E4E4E7] font-mono text-sm focus:border-[#8B5CF6] focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E4E4E7]"
                    >
                      {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="border border-[#1A1A25] rounded-xl p-4 bg-[#0A0A12]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#a855f7]">⇌</span>
                      <span className="font-heading font-bold text-[#E4E4E7]">OpenRouter</span>
                      <span className="text-xs text-[#71717A] ml-2">Free models · llama-3.1-8b</span>
                    </div>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a855f7] text-xs flex items-center gap-1 hover:underline"
                    >
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys.openrouter ? "text" : "password"}
                      value={apiKeys.openrouter}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, openrouter: e.target.value }))}
                      placeholder="sk-or-..."
                      className="w-full bg-[#12121A] border border-[#1A1A25] rounded-xl p-3 pr-10 text-[#E4E4E7] font-mono text-sm focus:border-[#a855f7] focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, openrouter: !prev.openrouter }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E4E4E7]"
                    >
                      {showKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OpenAI */}
                <div className="border border-[#1A1A25] rounded-xl p-4 bg-[#0A0A12]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#22C55E]">○</span>
                      <span className="font-heading font-bold text-[#E4E4E7]">OpenAI</span>
                      <span className="text-xs text-[#71717A] ml-2">Optional · gpt-4o-mini</span>
                    </div>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#22C55E] text-xs flex items-center gap-1 hover:underline"
                    >
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys.openai ? "text" : "password"}
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                      placeholder="sk-..."
                      className="w-full bg-[#12121A] border border-[#1A1A25] rounded-xl p-3 pr-10 text-[#E4E4E7] font-mono text-sm focus:border-[#22C55E] focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#E4E4E7]"
                    >
                      {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#71717A] text-center mt-6">
                Keys are saved in your browser only — never sent to any server other than the respective AI provider.
              </p>
            </div>
          )}
        </div>

                {/* Analyze Button */}
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
        </div>

        {/* Results */}
        {isAnalyzing && <AnalyzerLoading />}
        {!isAnalyzing && result && <div className="animate-in fade-in duration-500"><AnalysisResults result={result} addToast={addToast} currencySymbol={currency} /></div>}
      </div>
    </section>
  )
}
