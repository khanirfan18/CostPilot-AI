import { Navbar } from "@/components/clarity-lens/navbar"
import { Hero } from "@/components/clarity-lens/hero"
import { Features } from "@/components/clarity-lens/features"
import { HowItWorks } from "@/components/clarity-lens/how-it-works"
import { Analyzer } from "@/components/clarity-lens/analyzer"
import { Footer } from "@/components/clarity-lens/footer"

export default function CostPilotPage() {
  return (
    <main className="min-h-screen bg-[#0A0A12] text-[#E4E4E7] relative z-0">
      <div className="fixed inset-0 square-mat pointer-events-none z-0" />
      <div className="relative z-10">
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
