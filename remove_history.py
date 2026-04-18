import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# 1. Remove HistoryEntry interface
content = re.sub(
    r'interface HistoryEntry \{\n\s*id: string\n\s*timestamp: number\n\s*preview: string\n\s*result: AnalysisResult\n\}',
    '',
    content
)

# 2. Remove history state
content = re.sub(
    r'\s*const \[history, setHistory\] = useState<HistoryEntry\[\]>\(\[\]\)',
    '',
    content
)

# 3. Remove localStorage loading for history
content = re.sub(
    r'    const savedHistory = localStorage\.getItem\("claritylens_history"\)\n    if \(savedHistory\) \{\n      try \{\n        setHistory\(JSON\.parse\(savedHistory\)\)\n      \} catch \{\}\n    \}\n    \n',
    '',
    content
)

# 4. Remove saveToHistory function
content = re.sub(
    r'  const saveToHistory = useCallback\(\(text: string, analysisResult: AnalysisResult\) => \{.*?\n      return updated\n    \}\)\n  \}, \[\]\)',
    '',
    content,
    flags=re.DOTALL
)

# 5. Remove saveToHistory call
content = re.sub(
    r'\s*saveToHistory\(agreementText, analysisResult\)',
    '',
    content
)

# 6. Remove History UI block
content = re.sub(
    r'\s*\{\/\* History \*\/\}\n\s*\{history\.length > 0 && \(.*?\n\s*\}\)\}\s*<\/div>\n\s*<\/div>\n\s*\)\}',
    '',
    content,
    flags=re.DOTALL
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)

