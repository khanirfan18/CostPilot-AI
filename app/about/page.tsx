import { Press_Start_2P } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Linkedin, ArrowLeft } from 'lucide-react'

const pixelFont = Press_Start_2P({ weight: '400', subsets: ['latin'] })

export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-buildings {
          from { background-position: 0 bottom; }
          to { background-position: -2400px bottom; }
        }
        @keyframes fly {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1.5deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fly {
          animation: fly 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in-up 1.5s ease-out forwards;
        }
        
        .buildings {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='100' viewBox='0 0 300 100'%3E%3Cpath fill='%2364748b' d='M0,100v-50h30v50 h10v-70h40v70 h20v-30h30v30 h20v-80h50v80 h10v-40h40v40 h15v-60h35v60'/%3E%3C/svg%3E");
          background-size: 400px 150px;
          background-repeat: repeat-x;
          background-position: bottom;
          animation: scroll-buildings 30s linear infinite;
        }
        
        @media (max-width: 640px) {
          .buildings {
            background-size: 200px 75px;
          }
        }
      `}} />

      <main className={`min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-sky-200 text-white relative overflow-hidden flex flex-col items-center justify-center select-none ${pixelFont.className}`}>
        
        {/* Scrolling City Buildings */}
        <div className="absolute bottom-0 w-full h-[20%] md:h-[30%] z-0 opacity-40 pointer-events-none buildings" />

        {/* Back Link */}
        <div className="absolute top-4 left-4 md:top-10 md:left-10 z-50">
          <Link href="/" className={`inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-3 border-2 border-white/60 bg-white/30 hover:bg-white/50 rounded-xl text-white transition-all duration-300 text-[10px] md:text-sm uppercase hover:scale-[1.02] backdrop-blur-sm shadow-md ${pixelFont.className}`}>
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> Back
          </Link>
        </div>

        {/* Content Container to handle strict centering and spacing on mobile */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-4xl px-4 mt-8 md:mt-0 gap-8 md:gap-12 animate-fade-in">
          
          {/* Top Text Card */}
          <div className="bg-white/30 backdrop-blur-md p-5 py-8 md:p-12 rounded-2xl md:rounded-3xl border-2 border-white/60 shadow-2xl w-full text-center">
            <h1 className={`text-[14px] sm:text-xl md:text-4xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] leading-loose mb-5 md:mb-8 tracking-widest ${pixelFont.className}`}>
              Hii I'm Irfan
            </h1>
            <div className={`text-[8px] sm:text-xs md:text-lg text-blue-900 leading-6 md:leading-8 drop-shadow-sm flex flex-col sm:flex-row items-center justify-center flex-wrap gap-2 md:gap-3 ${pixelFont.className}`}>
              <span>I built this during</span>
              <span className="flex space-x-1 mx-1 text-[12px] sm:text-sm md:text-2xl drop-shadow-md bg-white/60 px-2 py-1.5 md:px-3 md:py-2 rounded-md md:rounded-xl border border-white/50">
                <span className="text-red-500">M</span><span className="text-blue-600">L</span><span className="text-yellow-400">H</span>
              </span> 
              <span>AI Hackefest</span>
            </div>
            <p className={`mt-6 md:mt-8 text-[7px] md:text-xs text-blue-900 tracking-[0.1em] md:tracking-[0.2em] font-bold uppercase bg-white/50 inline-block px-3 py-2 md:px-5 md:py-3 rounded-full border border-white/40 ${pixelFont.className}`}>
              Do check out my socials 👇
            </p>
          </div>

          {/* Superman Image Focus */}
          <div className="w-full max-w-[120px] sm:max-w-[150px] md:max-w-[300px] pointer-events-none mb-4 md:mb-0">
            <div className="animate-fly w-full flex justify-center">
              <Image 
                src="/supe.png" 
                alt="Pixel Superman Flying" 
                width={300} 
                height={150} 
                className="w-full h-auto drop-shadow-xl"
                priority
              />
            </div>
          </div>
          
        </div>

        {/* Bottom Socials */}
        <div className="absolute bottom-6 md:bottom-8 w-full z-40 flex justify-center items-center gap-5 md:gap-12 px-4">
          <a href="https://github.com/khanirfan18" target="_blank" rel="noopener noreferrer" 
             className="relative flex items-center justify-center p-3 md:p-5 bg-white/30 backdrop-blur-md border-[3px] border-pink-500 hover:border-pink-400 hover:bg-pink-500/20 rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-2 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] group">
            <Github className="w-5 h-5 md:w-8 md:h-8 text-pink-600 group-hover:text-pink-100 transition-colors" />
          </a>
          
          <a href="https://x.com/irfnn_k" target="_blank" rel="noopener noreferrer" 
             className="relative flex items-center justify-center p-3 md:p-5 bg-white/30 backdrop-blur-md border-[3px] border-cyan-400 hover:border-cyan-300 hover:bg-cyan-400/20 rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-2 shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] group">
            <Twitter className="w-5 h-5 md:w-8 md:h-8 text-cyan-600 group-hover:text-cyan-100 transition-colors" />
          </a>
          
          <a href="https://www.linkedin.com/in/irfankhan1855/" target="_blank" rel="noopener noreferrer" 
             className="relative flex items-center justify-center p-3 md:p-5 bg-white/30 backdrop-blur-md border-[3px] border-emerald-400 hover:border-emerald-300 hover:bg-emerald-400/20 rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-2 shadow-[0_0_15px_rgba(52,211,153,0.5)] hover:shadow-[0_0_25px_rgba(52,211,153,0.8)] group">
            <Linkedin className="w-5 h-5 md:w-8 md:h-8 text-emerald-600 group-hover:text-emerald-100 transition-colors" />
          </a>
        </div>

      </main>
    </>
  )
}
