with open("components/clarity-lens/analyzer.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
    '        if (activeTab === "manual") {\n          // Manual calculation\n          analysisResult = calculateManual()\n          addToast("Analysis complete!", "success")',
    '        if (activeTab === "manual") {\n          // Manual calculation\n          await new Promise(resolve => setTimeout(resolve, 3000));\n          analysisResult = calculateManual()\n          addToast("Analysis complete!", "success")'
)

with open("components/clarity-lens/analyzer.tsx", "w", encoding="utf-8") as f:
    f.write(text)
