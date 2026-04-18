"use client"

import { useState, useEffect } from "react"
import { Menu, X, Search } from "lucide-react"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Analyzer", href: "#analyzer" },
  { label: "Contact", href: "#footer" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled ? "bg-[#050508]/80 backdrop-blur-md" : "bg-[#050508]/95"
      } border-b border-[#1A1A25]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#8B5CF6] flex items-center justify-center">
              <Search className="w-5 h-5 text-[#E4E4E7]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-[#E4E4E7] text-lg leading-tight">ClarityLens</span>
              <span className="text-[10px] text-[#71717A] uppercase tracking-wider">AI Audit Engine</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#71717A] hover:text-[#E4E4E7] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#analyzer"
              className="font-heading bg-[#8B5CF6] text-[#0A0A12] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#8B5CF6] hover:scale-105 transition-all duration-200"
            >
              Try Now →
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#71717A] hover:text-[#E4E4E7] transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute top-16 left-0 right-0 bg-[#050508] border-b border-[#1A1A25] transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-[#71717A] hover:text-[#8B5CF6] py-3 px-4 rounded-lg hover:bg-[#12121A] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#analyzer"
            onClick={() => setIsOpen(false)}
            className="font-heading mt-2 bg-[#8B5CF6] text-[#0A0A12] font-bold text-center py-3 px-4 rounded-full hover:bg-[#8B5CF6] transition-colors duration-200"
          >
            Try Now →
          </a>
        </div>
      </div>
    </nav>
  )
}
