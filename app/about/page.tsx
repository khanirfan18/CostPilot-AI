import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0A0A12] text-[#E4E4E7] p-8 pb-16 font-sans relative">
      <div className="fixed inset-0 square-mat pointer-events-none z-0" />
      <div className="relative z-10 max-w-4xl mx-auto pt-10">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-[#E23636] hover:bg-[#C32828] border-2 border-[#F7D002] px-5 py-2.5 rounded-full text-white font-black tracking-widest text-sm uppercase transition-all duration-300 transform hover:-translate-x-1 shadow-[0_0_15px_rgba(226,54,54,0.4)] mb-12"
        >
          ← Return to app
        </Link>
        
        <div className="border border-[#1A1A25] bg-[#12121A]/80 backdrop-blur-sm p-12 md:p-16 rounded-3xl shadow-xl">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-8 tracking-tight">
            about goes here
          </h1>
        </div>
      </div>
    </main>
  )
}
