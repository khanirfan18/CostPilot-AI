"use client"

const features = [
  "Plain English",
  "True Cost",
  "Hidden Fees",
  "Risk Rating",
]

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-24 overflow-hidden"
    >
      {/* Subtle static dot grid background for performance */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      
        {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16">
        
        {/* Left Side: Headlines */}
        <div className="flex-1 text-left sm:text-center lg:text-left">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1A1A25] bg-[#12121A]/80 mb-8 mx-auto lg:mx-0">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] pulse-dot" />
            <span className="text-sm font-medium text-[#A1A1AA]">AI Financial Transparency Engine</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-[#EAB308]xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-[#E4E4E7]">Understand the</span>
            <br />
            <span className="text-[#8B5CF6] inline-block mt-2">True Cost</span>
            <br />
            <span className="text-[#E4E4E7] mt-2 inline-block">of Any Agreement</span>
          </h1>

          {/* Subtext */}
          <p className="font-heading text-[#A1A1AA] text-[#EAB308]ase sm:text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
            Paste any loan, credit card, or BNPL agreement. Our AI extracts every term, 
            calculates the real total cost, and surfaces every hidden charge — in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
            <a
              href="#analyzer"
              className="font-heading flex items-center gap-2 bg-[#8B5CF6] text-[#E4E4E7] font-semibold px-8 py-4 rounded-xl hover:bg-[#8B5CF6] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <span>🔍</span>
              <span>Try Analyzer</span>
            </a>
            <a
              href="#features"
              className="flex items-center justify-between xl:justify-center gap-2 bg-[#12121A] text-[#E4E4E7] font-medium px-8 py-4 rounded-xl border border-[#1A1A25] hover:border-[#8B5CF6]/50 hover:bg-[#1A1A25] transition-all duration-200 w-full sm:w-auto text-center"
            >
              <span>Learn More</span>
              <span className="text-[#71717A]">↓</span>
            </a>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-[#1A1A25] lg:w-fit">
            {features.map((feature, i) => {
              const icons = ["📄", "💰", "⚠️", "🚨"];
              return (
                <div key={feature} className="flex items-center gap-2 text-[#71717A] text-sm font-medium">
                  <span>{icons[i]}</span>
                  <span>{feature}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Visual Demo Card */}
        <div className="flex-1 w-full max-w-2xl lg:max-w-none relative">
          
          <div className="relative bg-[#12121A] border border-[#1A1A25] rounded-2xl p-6 shadow-xl shadow-black/40 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            
            {/* Window controls header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-[#EAB308] border-[#1A1A25]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
                <span className="text-sm font-medium text-[#E4E4E7] ml-2 font-heading">Audit Report</span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full border border-[#1A1A25] bg-transparent text-[#71717A] font-medium">Personal Loan</span>
            </div>

            {/* Shock Insight Banner */}
            <div className="bg-[#1A1A25] border border-[#EAB308]/20 rounded-xl p-5 mb-6">
              <div className="font-heading text-[#EAB308] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>⚡</span> SHOCK INSIGHT
              </div>
              <p className="font-heading text-[#E4E4E7] text-lg font-medium">
                You will pay <span className="font-heading text-[#EAB308] font-bold tabular-nums">$1,086</span> for a <span className="text-[#8B5CF6] tabular-nums">$1,000</span> loan
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-transparent border border-[#1A1A25] rounded-xl p-4">
                <p className="font-heading text-xl font-semibold text-[#E4E4E7] mb-1 tabular-nums">$88</p>
                <p className="text-xs text-[#71717A] font-medium">Monthly EMI</p>
              </div>
              <div className="bg-transparent border border-[#1A1A25] rounded-xl p-4">
                <p className="font-heading text-xl font-semibold text-[#E4E4E7] mb-1 tabular-nums">12.68%</p>
                <p className="text-xs text-[#71717A] font-medium">Effective Rate</p>
              </div>
              <div className="bg-transparent border border-[#1A1A25] rounded-xl p-4">
                <p className="font-heading text-xl font-semibold text-[#EAB308] mb-1">MEDIUM</p>
                <p className="text-xs text-[#71717A] font-medium">Risk Level</p>
              </div>
            </div>

            {/* Cost Breakdown Progress Bars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="text-[#71717A]">Cost Distribution</span>
                <span className="text-[#A1A1AA] tabular-nums">$1,086 total</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                   <div className="w-16 text-xs text-[#A1A1AA] font-medium">Principal</div>
                   <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                     <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '92%' }} />
                   </div>
                   <div className="w-8 text-xs text-[#A1A1AA] text-right font-medium tabular-nums">92%</div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-16 text-xs text-[#A1A1AA] font-medium">Interest</div>
                   <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                     <div className="h-full bg-[#EAB308] rounded-full" style={{ width: '6%' }} />
                   </div>
                   <div className="w-8 text-xs text-[#A1A1AA] text-right font-medium tabular-nums">6%</div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-16 text-xs text-[#A1A1AA] font-medium">Fees</div>
                   <div className="flex-1 h-2 bg-transparent rounded-full overflow-hidden">
                     <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '2%' }} />
                   </div>
                   <div className="w-8 text-xs text-[#A1A1AA] text-right font-medium tabular-nums">2%</div>
                </div>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-[#1A1A25] text-xs text-[#71717A] font-medium">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                 <span>AI Active</span>
               </div>
               <span>·</span>
               <span>Powered by Gemini</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
