"use client"

import { useInView } from "@/hooks/use-in-view"
import { FileText, Calculator, AlertTriangle, Shield, BarChart3, Cpu } from "lucide-react"

const features = [
  {
    icon: FileText,
    iconBg: "#1e3a8a",
    badge: "AI-Powered",
    badgeColor: "#8B5CF6",
    title: "Plain English Explanation",
    description: "Complex legal and financial jargon translated into simple, human language — no finance degree required.",
    hasLink: true,
  },
  {
    icon: Calculator,
    iconBg: "#065f46",
    badge: "Precise Math",
    badgeColor: "#22C55E",
    title: "Accurate Cost Calculation",
    description: "Full amortization breakdown with EMI, total interest, effective APR, and total payable — to the last rupee.",
    hasLink: false,
  },
  {
    icon: AlertTriangle,
    iconBg: "#78350f",
    badge: "Transparency",
    badgeColor: "#EAB308",
    title: "Hidden Charges Detection",
    description: "Surfaces processing fees, compounding traps, prepayment penalties, and conditional charges buried in fine print.",
    hasLink: false,
  },
  {
    icon: Shield,
    iconBg: "#7f1d1d",
    badge: "Risk Audit",
    badgeColor: "#EF4444",
    title: "Risk Analysis",
    description: "Every agreement scored LOW / MEDIUM / HIGH based on interest structure, fee transparency, and penalty clauses.",
    hasLink: true,
  },
  {
    icon: BarChart3,
    iconBg: "#4c1d95",
    badge: "Charts",
    badgeColor: "#8B5CF6",
    title: "Visual Breakdown",
    description: "Interactive charts — cost distribution donut, EMI composition over time, and outstanding balance curve.",
    hasLink: true,
  },
  {
    icon: Cpu,
    iconBg: "#431407",
    badge: "Fault-Tolerant",
    badgeColor: "#f97316",
    title: "Multi-Provider AI",
    description: "OpenRouter → Gemini → OpenAI with automatic fallback. Works in Demo Mode with zero API keys.",
    hasLink: false,
  },
]

export function Features() {
  const { ref, isVisible } = useInView()

  return (
    <section
      id="features"
      ref={ref}
      className={`py-12 px-4 fade-in-section ${isVisible ? "visible" : ""}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="text-[#8B5CF6] text-[10px] md:text-xs font-medium uppercase tracking-widest">
            CAPABILITIES
          </span>
          <h2 className="font-heading mt-2 text-2xl sm:text-3xl font-black text-balance">
            <span className="text-[#E4E4E7]">Everything You Need to </span>
            <span className="text-[#8B5CF6]">See Through</span>
            <span className="text-[#E4E4E7]"> the Fine Print</span>
          </h2>
          <p className="mt-2 text-sm text-[#71717A] max-w-2xl mx-auto">
            Our AI-powered engine analyzes financial documents to reveal what lenders don&apos;t want you to see.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#12121A] border border-[#1A1A25] rounded-xl p-5 hover:border-[#27272A] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: feature.iconBg }}
                >
                  <feature.icon className="w-6 h-6 text-[#E4E4E7]" />
                </div>
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${feature.badgeColor}20`,
                    color: feature.badgeColor 
                  }}
                >
                  {feature.badge}
                </span>
              </div>
              <h3 className="font-heading text-base font-bold text-[#E4E4E7] mb-1">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed mb-3">
                {feature.description}
              </p>
              {feature.hasLink && (
                <a
                  href="#analyzer"
                  className="text-[#8B5CF6] text-xs font-medium hover:underline"
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
