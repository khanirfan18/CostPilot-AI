"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Eye, EyeOff, Copy, FileText, ExternalLink, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { AnalysisResults } from "./analysis-results"
import { ToastContainer, useToast } from "./toast"

// Types
interface HiddenCharge {
  name: string
  amount: number
  description: string
}

interface RiskFactors {
  interestStructure: "LOW" | "MEDIUM" | "HIGH"
  feeTransparency: "LOW" | "MEDIUM" | "HIGH"
  penaltyClauses: "LOW" | "MEDIUM" | "HIGH"
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
  interestRate: number
  tenure: number
  monthlyEMI: number
  totalPayable: number
  totalInterest: number
  effectiveAPR: number
  hiddenCharges: HiddenCharge[]
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  riskFactors: RiskFactors
  amortization: AmortizationEntry[]
}

interface HistoryEntry {
  id: string
  timestamp: number
  preview: string
  result: AnalysisResult
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
  plainEnglish: "This is a ₹2,50,000 personal loan at 16% annual interest for 24 months. After deducting the 2.5% processing fee upfront, you actually receive only ₹2,43,750. The mandatory insurance (₹1,200) and legal charges (₹500) add to your real cost. Your effective APR is 19.8% — significantly higher than the stated 16% due to these hidden charges.",
  loanAmount: 250000,
  interestRate: 16,
  tenure: 24,
  monthlyEMI: 12289,
  totalPayable: 294936,
  totalInterest: 44936,
  effectiveAPR: 19.8,
  hiddenCharges: [
    { name: "Processing Fee", amount: 6250, description: "2.5% deducted upfront — reduces actual disbursed amount" },
    { name: "Insurance Premium", amount: 1200, description: "Mandatory insurance added to principal" },
    { name: "Legal Charges", amount: 500, description: "One-time legal documentation fee" },
    { name: "Prepayment Penalty", amount: 0, description: "4% of outstanding if repaid before 12 months" }
  ],
  riskLevel: "MEDIUM",
  riskFactors: { interestStructure: "MEDIUM", feeTransparency: "HIGH", penaltyClauses: "MEDIUM" },
  amortization: generateAmortization(250000, 16, 24)
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

const AI_PROMPT = `You are a financial transparency expert. Analyze the agreement below and return ONLY valid raw JSON — no markdown, no backticks, no explanation whatsoever. Return exactly this structure:
{
  "plainEnglish": "string — plain language summary of the agreement and its real costs",
  "loanAmount": number,
  "interestRate": number,
  "tenure": number,
  "monthlyEMI": number,
  "totalPayable": number,
  "totalInterest": number,
  "effectiveAPR": number,
  "hiddenCharges": [{ "name": "string", "amount": number, "description": "string" }],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskFactors": {
    "interestStructure": "LOW" | "MEDIUM" | "HIGH",
    "feeTransparency": "LOW" | "MEDIUM" | "HIGH",
    "penaltyClauses": "LOW" | "MEDIUM" | "HIGH"
  },
  "amortization": [{ "month": number, "emi": number, "principal": number, "interest": number, "balance": number }]
}
Agreement:
`

export function Analyzer() {
  const { ref, isVisible } = useInView()
  const { toasts, addToast, removeToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai")
  const [currency, setCurrency] = useState("₹")
  const [agreementText, setAgreementText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  
  // Manual entry fields
  const [manualFields, setManualFields] = useState({
    principal: 100000,
    interestRate: 12,
    tenure: 12,
    processingFee: 2,
    prepaymentPenalty: 3,
    latePaymentFee: 500
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
    const savedHistory = localStorage.getItem("claritylens_history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch {}
    }
    
    setApiKeys({
      openrouter: localStorage.getItem("user_claritylens_openrouter_key") || "",
      gemini: localStorage.getItem("user_claritylens_gemini_key") || "",
      openai: localStorage.getItem("user_claritylens_openai_key") || ""
    })
  }, [])

  // Save API keys to localStorage when they change
  useEffect(() => {
    if (apiKeys.openrouter) {
      localStorage.setItem("user_claritylens_openrouter_key", apiKeys.openrouter)
    } else {
      localStorage.removeItem("user_claritylens_openrouter_key")
    }
    
    if (apiKeys.gemini) {
      localStorage.setItem("user_claritylens_gemini_key", apiKeys.gemini)
    } else {
      localStorage.removeItem("user_claritylens_gemini_key")
    }
    
    if (apiKeys.openai) {
      localStorage.setItem("user_claritylens_openai_key", apiKeys.openai)
    } else {
      localStorage.removeItem("user_claritylens_openai_key")
    }
  }, [apiKeys])

  const saveToHistory = useCallback((text: string, analysisResult: AnalysisResult) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      preview: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
      result: analysisResult
    }
    
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 3)
      localStorage.setItem("claritylens_history", JSON.stringify(updated))
      return updated
    })
  }, [])

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
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
        const activeOpenRouter = apiKeys.openrouter || process.env.NEXT_PUBLIC_OPENROUTER_KEY || ""
        const activeGemini = apiKeys.gemini || process.env.NEXT_PUBLIC_GEMINI_KEY || ""
        const activeOpenAI = apiKeys.openai || process.env.NEXT_PUBLIC_OPENAI_KEY || ""
        
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
        
        saveToHistory(agreementText, analysisResult)
      }

      setResult(analysisResult)
    } catch {
      addToast("Analysis failed", "error")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateManual = (): AnalysisResult => {
    const { principal, interestRate, tenure, processingFee, prepaymentPenalty, latePaymentFee } = manualFields
    const monthlyRate = interestRate / 12 / 100
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1)
    const totalPayable = emi * tenure
    const totalInterest = totalPayable - principal
    const processingFeeAmount = (processingFee / 100) * principal
    const effectivePrincipal = principal - processingFeeAmount
    const effectiveAPR = ((totalPayable - effectivePrincipal) / effectivePrincipal / (tenure / 12)) * 100

    const hiddenCharges: HiddenCharge[] = []
    if (processingFee > 0) {
      hiddenCharges.push({ 
        name: "Processing Fee", 
        amount: Math.round(processingFeeAmount), 
        description: `${processingFee}% deducted upfront` 
      })
    }
    if (prepaymentPenalty > 0) {
      hiddenCharges.push({ 
        name: "Prepayment Penalty", 
        amount: 0, 
        description: `${prepaymentPenalty}% of outstanding if prepaid` 
      })
    }
    if (latePaymentFee > 0) {
      hiddenCharges.push({ 
        name: "Late Payment Fee", 
        amount: latePaymentFee, 
        description: `${currency}${latePaymentFee} per month penalty` 
      })
    }

    // Risk scoring
    const interestRisk = interestRate < 12 ? "LOW" : interestRate <= 18 ? "MEDIUM" : "HIGH"
    const feeRisk = hiddenCharges.length === 0 ? "LOW" : hiddenCharges.length <= 2 ? "MEDIUM" : "HIGH"
    const penaltyRisk = prepaymentPenalty === 0 ? "LOW" : prepaymentPenalty < 5 ? "MEDIUM" : "HIGH"
    
    const riskScores = { LOW: 1, MEDIUM: 2, HIGH: 3 }
    const maxRisk = Math.max(riskScores[interestRisk], riskScores[feeRisk], riskScores[penaltyRisk])
    const overallRisk = maxRisk === 3 ? "HIGH" : maxRisk === 2 ? "MEDIUM" : "LOW"

    return {
      plainEnglish: `This is a ${currency}${principal.toLocaleString()} loan at ${interestRate}% annual interest for ${tenure} months. Your monthly EMI will be ${currency}${Math.round(emi).toLocaleString()}. Total amount payable is ${currency}${Math.round(totalPayable).toLocaleString()}, including ${currency}${Math.round(totalInterest).toLocaleString()} in interest.${processingFee > 0 ? ` The ${processingFee}% processing fee (${currency}${Math.round(processingFeeAmount).toLocaleString()}) reduces your effective disbursement.` : ""} Your effective APR is ${effectiveAPR.toFixed(1)}%.`,
      loanAmount: principal,
      interestRate,
      tenure,
      monthlyEMI: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      effectiveAPR: parseFloat(effectiveAPR.toFixed(1)),
      hiddenCharges,
      riskLevel: overallRisk,
      riskFactors: {
        interestStructure: interestRisk,
        feeTransparency: feeRisk,
        penaltyClauses: penaltyRisk
      },
      amortization: generateAmortization(principal, interestRate, tenure)
    }
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
                onClick={() => setAgreementText(EXAMPLE_TEXT)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#8B5CF6] text-[#8B5CF6] text-sm hover:bg-[#8B5CF6]/10 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Try Example
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-[#71717A] mb-2">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
                <div className="flex gap-2 flex-wrap">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => {
                        setAgreementText(entry.preview.replace("...", ""))
                        setResult(entry.result)
                      }}
                      className="text-xs px-3 py-1 rounded-full bg-[#1A1A25] text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#27272A] transition-colors"
                    >
                      {new Date(entry.timestamp).toLocaleTimeString()} - {entry.preview.slice(0, 20)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-2">
              PASTE FINANCIAL AGREEMENT
            </label>
            <textarea
              value={agreementText}
              onChange={(e) => setAgreementText(e.target.value)}
              placeholder={`Paste any financial text here — loan terms, credit card agreement, BNPL offer...

Example:
Loan: ₹1,00,000 at 14% p.a. for 12 months. Processing fee 2%. Prepayment penalty 3%.`}
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
                      onChange={(e) => setManualFields(prev => ({
                        ...prev,
                        [field.key]: parseFloat(e.target.value) || 0
                      }))}
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
        <button
          onClick={analyze}
          disabled={isAnalyzing}
          className={`font-heading w-full py-4 rounded-[14px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
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

        {/* Results */}
        {result && <AnalysisResults result={result} addToast={addToast} currencySymbol={currency} />}
      </div>
    </section>
  )
}
