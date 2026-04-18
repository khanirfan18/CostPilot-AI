import re

with open("components/clarity-lens/analyzer.tsx", "r", encoding="utf-8") as f:
    content = f.read()

loader_code = """
const LOADING_MESSAGES = [
  "Hang tight, analyzing your loan... ⏳",
  "Detecting hidden charges... 🕵️",
  "Calculating true cost... 💸",
  "Uncovering sneaky fees... 👀",
  "Almost done... polishing results ✨"
];

const PROGRESS_STEPS = [
  "Parsing input",
  "Calculating EMI",
  "Detecting hidden charges",
  "Generating insights"
];

function AnalyzerLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    const stepInterval = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="w-full bg-[#12121A] border border-[#1A1A25] rounded-2xl p-8 mt-8 flex flex-col items-center justify-center animate-in fade-in fade-out duration-500 min-h-[350px]">
      <div className="relative mb-6 w-16 h-16 flex items-center justify-center">
        <div className="text-5xl animate-bounce absolute">💸</div>
        <div className="text-3xl animate-pulse absolute -right-4 -bottom-2">🧠</div>
      </div>
      
      <h3 className="font-heading text-xl font-bold text-[#E4E4E7] mb-8 text-center transition-all duration-300">
        {LOADING_MESSAGES[messageIndex]}
      </h3>

      <div className="w-full max-w-md space-y-3">
        {PROGRESS_STEPS.map((step, idx) => {
          const isActive = idx === stepIndex;
          const isCompleted = idx < stepIndex;
          
          return (
            <div 
              key={step} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                isActive ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#E4E4E7]" : 
                isCompleted ? "bg-[#22C55E]/5 border-[#22C55E]/20 text-[#71717A]" : 
                "bg-[#0A0A12] border-[#1A1A25] text-[#404040]"
              }`}
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {isCompleted ? (
                  <span className="text-[#22C55E]">✔</span>
                ) : isActive ? (
                  <span className="text-[#8B5CF6] inline-block animate-spin">⏳</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#404040]"></span>
                )}
              </div>
              <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Analyzer() {"""

if "AnalyzerLoading" not in content:
    content = content.replace("export function Analyzer() {", loader_code)

# Ensure result clears immediately on analyze click
if "const analyze = async () => {" in content:
    content = content.replace(
        "const analyze = async () => {\n    if (!text && activeTab === \"text\") return",
        "const analyze = async () => {\n    if (!text && activeTab === \"text\") return\n    setResult(null)\n    setIsAnalyzing(true)"
    )

content = content.replace(
    "{result && <AnalysisResults result={result} addToast={addToast} currencySymbol={currency} />}",
    "{isAnalyzing && <AnalyzerLoading />}\n        {!isAnalyzing && result && <div className=\"animate-in fade-in duration-500\"><AnalysisResults result={result} addToast={addToast} currencySymbol={currency} /></div>}"
)

# make sure to handle manual calculation with a delay so loading is seen
content = re.sub(
    r'(\s*if \(activeTab === "manual"\) \{\n\s*)analysisResult = calculateManual\(\)',
    r'\1await new Promise(resolve => setTimeout(resolve, 3000));\n      analysisResult = calculateManual()',
    content
)

with open("components/clarity-lens/analyzer.tsx", "w", encoding="utf-8") as f:
    f.write(content)
