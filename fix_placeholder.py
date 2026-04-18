import re

with open("components/clarity-lens/analyzer.tsx", "r") as f:
    content = f.read()

# Update placeholder text
content = content.replace(
    '''placeholder={`Paste any financial text here — loan terms, credit card agreement, BNPL offer...

Example:
Loan: ₹1,00,000 at 14% p.a. for 12 months. Processing fee 2%. Prepayment penalty 3%.`}''',
    '''placeholder="Paste your loan agreement here..."'''
)

# And clear any UI glitches around "Try Example" hiding when typing
content = content.replace(
    '<Copy className="w-4 h-4" />\n                Try Example',
    '''<Copy className="w-4 h-4" />\n                {agreementText ? "Clear Editor" : "Try Example"}'''
)

content = content.replace(
    '''onClick={() => setAgreementText(EXAMPLE_TEXT)}''',
    '''onClick={() => { if (agreementText) { setAgreementText(""); if (result) setResult(null); } else { setAgreementText(EXAMPLE_TEXT); } }}'''
)

with open("components/clarity-lens/analyzer.tsx", "w") as f:
    f.write(content)

