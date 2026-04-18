"use client"

import { useInView } from "@/hooks/use-in-view"

const steps = [
  {
    number: "01",
    color: "#8B5CF6",
    title: "Paste Your Agreement",
    description: "Copy any financial text — loan terms, credit card agreement, BNPL offer, or mortgage document — and paste it into the analyzer.",
    bullets: ["Any format supported", "Structured or plain text", "No formatting needed"],
  },
  {
    number: "02",
    color: "#8B5CF6",
    title: "AI Analyzes & Extracts",
    description: "Multi-provider AI reads the text, extracts all financial parameters, and identifies hidden clauses automatically.",
    bullets: ["OpenRouter · Gemini · OpenAI", "Auto-fallback chain", "Demo Mode if no keys"],
  },
  {
    number: "03",
    color: "#22C55E",
    title: "Get Full Audit Report",
    description: "Receive a structured report with true cost calculations, hidden charge detection, visual charts, and risk classification.",
    bullets: ["EMI & APR breakdown", "Hidden charges flagged", "LOW / MEDIUM / HIGH risk"],
  },
]

export function HowItWorks() {
  const { ref, isVisible } = useInView()

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={`py-16 sm:py-24 px-4 fade-in-section ${isVisible ? "visible" : ""}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#8B5CF6] text-xs font-medium uppercase tracking-widest">
            SIMPLE PROCESS
          </span>
          <h2 className="font-heading mt-4 text-3xl sm:text-4xl font-black text-balance">
            <span className="text-[#E4E4E7]">From Agreement to Audit in </span>
            <span className="text-[#8B5CF6]">3 Steps</span>
          </h2>
          <p className="mt-4 text-[#71717A]">
            No setup. No sign-up. Paste text, get insights — under 30 seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex items-stretch gap-6">
                {/* Step number */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div
                    className="font-heading w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg relative z-10 bg-[#050508]"
                    style={{ 
                      backgroundColor: `${step.color}20`,
                      color: step.color,
                      border: `2px solid ${step.color}` 
                    }}
                  >
                    {step.number}
                  </div>
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div
                      className="absolute top-12 left-1/2 -translate-x-1/2 -bottom-6 w-0.5"
                      style={{ backgroundColor: `${step.color}40` }}
                    />
                  )}
                </div>

                {/* Step content */}
                <div
                  className="flex-1 bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6 relative group"
                  style={{ borderLeftColor: step.color, borderLeftWidth: "4px" }}
                >
                  <div
                    className="absolute -left-6 top-6 w-6 h-0.5 hidden sm:block"
                    style={{ backgroundColor: step.color }}
                  />
                  <h3 className="font-heading text-xl font-bold text-[#E4E4E7] mb-2">{step.title}</h3>
                  <p className="text-[#71717A] text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${step.color}15`,
                          color: step.color,
                        }}
                      >
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <a
            href="#analyzer"
            className="font-heading inline-flex items-center gap-2 bg-[#8B5CF6] text-[#0A0A12] font-bold px-8 py-4 rounded-[14px] hover:bg-[#8B5CF6] hover:scale-105 transition-all duration-200"
          >
            <span>🔍</span>
            <span>Try It Now — Free →</span>
          </a>
        </div>
      </div>
    </section>
  )
}
