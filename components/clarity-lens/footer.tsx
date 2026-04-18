"use client"

import { Search, Github } from "lucide-react"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Analyzer", href: "#analyzer" },
]

const tags = ["Neutral", "Factual", "No Advice", "Free to Use"]

export function Footer() {
  return (
    <footer id="footer" className="relative bg-[#050508] border-t border-[#1A1A25] pt-16 pb-8 px-4 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#8B5CF6]/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top section */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left side - Logo and tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#8B5CF6] flex items-center justify-center">
                <Search className="w-5 h-5 text-[#E4E4E7]" />
              </div>
              <div>
                <span className="font-heading font-bold text-[#E4E4E7] text-xl">CostPilot AI</span>
                <div className="text-[10px] text-[#71717A] uppercase tracking-wider">
                  AI FINANCIAL AUDIT ENGINE
                </div>
              </div>
            </div>
            <p className="text-[#71717A] text-sm mb-6 max-w-md">
              Turning financial confusion into clarity — one agreement at a time.
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#1A1A25] text-[#71717A] text-xs border border-[#1A1A25]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="md:text-right">
            <h4 className="text-xs text-[#71717A] uppercase tracking-widest mb-4">
              NAVIGATION
            </h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#71717A] hover:text-[#E4E4E7] text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-[#1A1A25] pt-8 mb-8">
          <h5 className="font-heading text-xs text-[#71717A] uppercase tracking-widest font-bold mb-2">
            DISCLAIMER
          </h5>
          <p className="text-xs text-[#71717A] max-w-3xl">
            CostPilot AI provides factual financial analysis for informational purposes only. 
            No content constitutes financial advice. Always verify figures with your lender 
            or a qualified financial advisor.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1A1A25] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#71717A]">
            © 2026 CostPilot AI — Built for financial transparency.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#71717A]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#E4E4E7] transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <span>·</span>
            <span>Made with ♥ for hackathons</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
