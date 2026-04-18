import { Navbar } from "@/components/costpilot/navbar"
import { Hero } from "@/components/costpilot/hero"
import { Features } from "@/components/costpilot/features"
import { HowItWorks } from "@/components/costpilot/how-it-works"
import { Analyzer } from "@/components/costpilot/analyzer"
import { Footer } from "@/components/costpilot/footer"
import Link from "next/link"

export default function CostPilotPage() {
  return (
    <main className="min-h-screen bg-[#0A0A12] text-[#E4E4E7] relative z-0">
      <div className="fixed inset-0 square-mat pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Analyzer />
        <Footer />
        
        </div>
    </main>
  )
}
