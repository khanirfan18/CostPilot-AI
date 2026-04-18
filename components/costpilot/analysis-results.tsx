"use client"

import { FileText, Copy, AlertTriangle, CheckCircle } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import type { AnalysisResult } from "./analyzer"
import type { ToastType } from "./toast"

interface AnalysisResultsProps {
  result: AnalysisResult
  addToast: (message: string, type: ToastType) => void
  currencySymbol: string
}

const COLORS = {
  cyan: "#8B5CF6",
  amber: "#EAB308",
  red: "#EF4444",
  green: "#22C55E",
  purple: "#8B5CF6",
}

function formatCurrency(amount: number | string, symbol: string): string {
  if (typeof amount === 'string') return amount;
  // Automatically switch formatting logic depending on standard standard formats
  if (symbol === "₹") {
    return `${symbol}${amount.toLocaleString("en-IN")}`
  }
  return `${symbol}${amount.toLocaleString("en-US")}`
}

function getRiskColor(level: "LOW" | "MEDIUM" | "HIGH"): string {
  switch (level) {
    case "LOW":
      return COLORS.green
    case "MEDIUM":
      return COLORS.amber
    case "HIGH":
      return COLORS.red
  }
}

export function AnalysisResults({ result, addToast, currencySymbol }: AnalysisResultsProps) {
  const costDistributionData = [
    { name: "Principal", value: typeof result.loanAmount === 'number' ? result.loanAmount : 0, color: COLORS.cyan },
    { name: "Interest", value: typeof result.totalInterest === 'number' ? result.totalInterest : 0, color: COLORS.amber },
    {
      name: "Fees",
      value: result.charges.reduce((sum, c) => sum + (c.isVariable || isNaN(Number(c.amount)) ? 0 : Number(c.amount)), 0),
      color: COLORS.red,
    },
  ]

  const emiCompositionData = result.amortization
    .filter((_, i) => i % 3 === 0 || i === result.amortization.length - 1)
    .map((entry) => ({
      month: `M${entry.month}`,
      Principal: entry.principal,
      Interest: entry.interest,
    }))

  const balanceCurveData = result.amortization.map((entry) => ({
    month: entry.month,
    balance: entry.balance,
  }))

  const handleExportPDF = () => {
    window.print()
  }

  const handleCopyResults = () => {
    const text = `CostPilot AI Audit Report
========================
Monthly EMI: ${formatCurrency(result.monthlyEMI, currencySymbol)}
Total Payable: ${formatCurrency(result.totalPayable, currencySymbol)}
Total Interest: ${formatCurrency(result.totalInterest, currencySymbol)}
Effective APR: ${result.effectiveAPR}${typeof result.effectiveAPR === 'number' ? '%' : ''}
Risk Level: ${result.riskScores.costRisk}

Hidden Charges:
${result.charges.map((c) => `- ${c.name}: ${c.isVariable ? c.amount : formatCurrency(Number(c.amount), currencySymbol)}`).join("\n")}

Summary:
${result.plainEnglish}
`
    navigator.clipboard.writeText(text)
    addToast("Copied to clipboard", "success")
  }

  return (
    <div className="mt-8 space-y-6 animate-in fade-in duration-500">
      {/* Results Header */}
      <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-[#22C55E]" />
          <span className="font-heading text-xl font-bold text-[#E4E4E7]">Analysis Complete</span>
        </div>
        <span
          className="font-heading px-4 py-2 rounded-full font-bold text-sm"
          style={{
            backgroundColor: `${getRiskColor(result.riskScores.costRisk)}20`,
            color: getRiskColor(result.riskScores.costRisk),
          }}
        >
          {result.riskScores.costRisk} RISK
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1A25] border border-[#1A1A25] rounded-xl p-4">
          <p className="text-xs text-[#71717A] uppercase mb-1">Monthly EMI</p>
          <p className="font-heading text-2xl font-black text-[#8B5CF6] tabular-nums">{formatCurrency(result.monthlyEMI, currencySymbol)}
          </p>
          <p className="text-xs text-[#71717A]">per month</p>
        </div>
        <div className="bg-[#1A1A25] border border-[#1A1A25] rounded-xl p-4">
          <p className="text-xs text-[#71717A] uppercase mb-1">Total Payable</p>
          <p className="font-heading text-2xl font-black text-[#E4E4E7] tabular-nums">{formatCurrency(result.totalPayable, currencySymbol)}
          </p>
          <p className="text-xs text-[#71717A]">over full tenure</p>
        </div>
        <div className="bg-[#1A1A25] border border-[#1A1A25] rounded-xl p-4">
          <p className="text-xs text-[#71717A] uppercase mb-1">Total Interest</p>
          <p className="font-heading text-2xl font-black text-[#EAB308] tabular-nums">{formatCurrency(result.totalInterest, currencySymbol)}
          </p>
          <p className="text-xs text-[#71717A]">cost of borrowing</p>
        </div>
        <div className="bg-[#1A1A25] border border-[#1A1A25] rounded-xl p-4">
          <p className="text-xs text-[#71717A] uppercase mb-1">Effective APR</p>
          <p className="font-heading text-2xl font-black text-[#EF4444]">
            {result.effectiveAPR}{typeof result.effectiveAPR === 'number' ? '%' : ''}
          </p>
          <p className="text-xs text-[#71717A]">true annual rate</p>
        </div>
      </div>

      {/* Plain English Summary */}
      <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#8B5CF6]" />
          <h3 className="font-heading font-bold text-[#E4E4E7]">📝 Plain English Summary</h3>
        </div>
        <p className="text-[#d1d5db] text-sm leading-relaxed">
          {result.plainEnglish}
        </p>
      </div>

      {/* Hidden Charges */}
      <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          {result.charges.length > 0 ? (
            <>
              <AlertTriangle className="w-5 h-5 text-[#EAB308]" />
              <h3 className="font-heading font-bold text-[#E4E4E7]">⚠️ Hidden Charges Detected</h3>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              <h3 className="font-heading font-bold text-[#E4E4E7]">✅ No Hidden Charges Detected</h3>
            </>
          )}
        </div>
        {result.charges.length > 0 ? (
          <div className="space-y-3">
            {result.charges.map((charge, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-2 border-b border-[#1A1A25] last:border-0"
              >
                <div>
                  <p className="text-[#E4E4E7] font-medium">{charge.name}</p>
                  <p className="text-xs text-[#71717A]">{charge.description}</p>
                </div>
                <span className="font-heading text-[#EAB308] font-bold tabular-nums">{!charge.isVariable ? formatCurrency(Number(charge.amount), currencySymbol) : charge.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#22C55E] text-sm">
            This agreement appears transparent with no hidden charges detected.
          </p>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cost Distribution Donut */}
        <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
          <h3 className="font-heading font-bold text-[#E4E4E7] mb-4">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={costDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {costDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A25",
                  border: "1px solid #1A1A25",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string): [string, string] => [formatCurrency(value, currencySymbol), name]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "#A1A1AA" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* EMI Composition Over Time */}
        <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
          <h3 className="font-heading font-bold text-[#E4E4E7] mb-4">EMI Composition Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={emiCompositionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A25" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717A", fontSize: 10 }}
                axisLine={{ stroke: "#1A1A25" }}
              />
              <YAxis
                tick={{ fill: "#71717A", fontSize: 10 }}
                axisLine={{ stroke: "#1A1A25" }}
                tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A25",
                  border: "1px solid #1A1A25",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string): [string, string] => [formatCurrency(value, currencySymbol), name]}
              />
              <Bar dataKey="Principal" stackId="a" fill={COLORS.cyan} />
              <Bar dataKey="Interest" stackId="a" fill={COLORS.amber} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "#A1A1AA" }}>{value}</span>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Outstanding Balance Curve */}
        <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
          <h3 className="font-heading font-bold text-[#E4E4E7] mb-4">Outstanding Balance Curve</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={balanceCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A25" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717A", fontSize: 10 }}
                axisLine={{ stroke: "#1A1A25" }}
                tickFormatter={(value) => `M${value}`}
              />
              <YAxis
                tick={{ fill: "#71717A", fontSize: 10 }}
                axisLine={{ stroke: "#1A1A25" }}
                tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A25",
                  border: "1px solid #1A1A25",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string): [string, string] => [formatCurrency(value, currencySymbol), name]}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={COLORS.cyan}
                fill={COLORS.cyan}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6">
        <h3 className="font-heading font-bold text-[#E4E4E7] mb-4">Risk Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: "Cost Risk", value: result.riskScores.costRisk },
            { label: "Penalty Risk", value: result.riskScores.penaltyRisk },
            { label: "Transparency Score", value: result.riskScores.transparencyScore },
          ].map((factor) => (
            <div
              key={factor.label}
              className="flex items-center justify-between py-2 border-b border-[#1A1A25] last:border-0"
            >
              <span className="text-[#d1d5db]">{factor.label}</span>
              <span
                className="font-heading px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${getRiskColor(factor.value)}20`,
                  color: getRiskColor(factor.value),
                }}
              >
                {factor.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 no-print">
        <button
          onClick={handleExportPDF}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#1A1A25] text-[#71717A] hover:text-[#E4E4E7] hover:border-[#E4E4E7] transition-colors"
        >
          <FileText className="w-5 h-5" />
          📄 Export PDF
        </button>
        <button
          onClick={handleCopyResults}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#1A1A25] text-[#71717A] hover:text-[#E4E4E7] hover:border-[#E4E4E7] transition-colors"
        >
          <Copy className="w-5 h-5" />
          📋 Copy Results
        </button>
      </div>

      {/* Gen Z Verdict */}
      <div className="mt-8 p-5 bg-[#12121A] border border-[#1A1A25] rounded-xl relative overflow-hidden group no-print">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 to-[#22D3EE]/5 opacity-10 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-4xl shrink-0">
            {result.riskScores.costRisk === "HIGH" ? "🚩" : result.riskScores.costRisk === "MEDIUM" ? "😬" : "💅"}
          </div>
          <div>
            <h4 className="font-heading text-xs text-[#8B5CF6] uppercase tracking-widest font-bold mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
              Real Talk Verdict
            </h4>
            <p className="text-[#E4E4E7] text-sm leading-relaxed font-medium">
              {result.riskScores.costRisk === "HIGH" 
                ? "Big yikes bestie. They are straight up trying to finesse you with these terms. Ghost them no cap, and find a better option rn."
                : result.riskScores.costRisk === "MEDIUM"
                ? "It's giving mid vibes ngl. It's not a complete scam, but u could probably do better if u shopped around. Don't settle too quick."
                : "Huge W. This deal is actually solid no cap. It passes the vibe check — secure it and go touch grass."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
