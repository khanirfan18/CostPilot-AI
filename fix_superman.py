with open("app/page.tsx", "r", encoding="utf-8") as f:
    page_content = f.read()

# Remove the superman button from app/page.tsx
start_marker = "{/* SUPERMAN ABOUT BUTTON AT THE VERY BOTTOM */}"
if start_marker in page_content:
    parts = page_content.split(start_marker)
    # The button is exactly until the "</div>\n      </div>\n    </main>" part
    page_content = parts[0] + "</div>\n    </main>\n  )\n}\n"

with open("app/page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)

with open("components/costpilot/footer.tsx", "r", encoding="utf-8") as f:
    footer_content = f.read()

if "import Link from \"next/link\"" not in footer_content:
    footer_content = footer_content.replace("\"use client\"\n\nimport { Search, Github } from \"lucide-react\"", "\"use client\"\n\nimport { Search, Github } from \"lucide-react\"\nimport Link from \"next/link\"")

disclaimer_old = """        {/* Disclaimer */}
        <div className="border-t border-[#1A1A25] pt-8 mb-8">
          <h5 className="font-heading text-xs text-[#71717A] uppercase tracking-widest font-bold mb-2">
            DISCLAIMER
          </h5>
          <p className="text-xs text-[#71717A] max-w-3xl">
            CostPilot AI provides factual financial analysis for informational purposes only. 
            No content constitutes financial advice. Always verify figures with your lender 
            or a qualified financial advisor.
          </p>
        </div>"""

disclaimer_new = """        {/* Disclaimer */}
        <div className="border-t border-[#1A1A25] pt-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h5 className="font-heading text-xs text-[#71717A] uppercase tracking-widest font-bold mb-2">
              DISCLAIMER
            </h5>
            <p className="text-xs text-[#71717A] max-w-3xl">
              CostPilot AI provides factual financial analysis for informational purposes only. 
              No content constitutes financial advice. Always verify figures with your lender 
              or a qualified financial advisor.
            </p>
          </div>
          
          <Link 
            href="/about"
            className="group relative px-6 py-2 shrink-0 rounded-lg font-black text-lg tracking-[0.1em] transform transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5 bg-[#EE2D24] hover:bg-[#D11810] border-[3px] border-[#FAE021] text-white hover:shadow-[0_8px_15px_rgba(238,45,36,0.3)] shadow-[0_4px_10px_rgba(238,45,36,0.15)] flex items-center justify-center"
          >
            <span className="relative z-20 font-heading uppercase" style={{textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000"}}>
              ABOUT
            </span>
          </Link>
        </div>"""

footer_content = footer_content.replace(disclaimer_old, disclaimer_new)

with open("components/costpilot/footer.tsx", "w", encoding="utf-8") as f:
    f.write(footer_content)
