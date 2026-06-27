import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "How do I convert decimal to binary?",
    answer: "To convert decimal to binary, repeatedly divide the number by 2 and record the remainders. Read the remainders from bottom to top. Example: 13 ÷ 2 = 6 R1, 6 ÷ 2 = 3 R0, 3 ÷ 2 = 1 R1, 1 ÷ 2 = 0 R1. Reading bottom to top: 1101. So decimal 13 = binary 1101. Our converter does this instantly and shows the step-by-step working."
  },
  {
    question: "How do I convert binary to decimal?",
    answer: "To convert binary to decimal, multiply each bit by its positional power of 2 and sum the results. Example: 1101 = (1×2³) + (1×2²) + (0×2¹) + (1×2⁰) = 8 + 4 + 0 + 1 = 13. Our calculator shows this step-by-step positional breakdown automatically."
  },
  {
    question: "What is hexadecimal used for?",
    answer: "Hexadecimal (base 16) is widely used in programming and computing: web colors (#FFFFFF for white, #000000 for black), memory addresses, MAC addresses in networking, cryptographic hashes, and Unicode character codes. One hex digit represents exactly 4 binary bits (a nibble), making it a compact way to represent binary data."
  },
  {
    question: "How do you convert decimal to hexadecimal?",
    answer: "Divide the decimal number by 16 repeatedly, recording remainders. Remainders 10–15 are represented as A–F. Example: 255 ÷ 16 = 15 remainder 15 (F), 15 ÷ 16 = 0 remainder 15 (F). Reading bottom to top: FF. So decimal 255 = hex FF. Our converter shows each division step clearly."
  },
  {
    question: "What is octal number system used for?",
    answer: "Octal (base 8) was historically used in computing systems that grouped binary digits in sets of 3. Today it is primarily used in Unix/Linux file permissions (e.g., chmod 777 means rwxrwxrwx). Each octal digit represents exactly 3 binary bits."
  },
  {
    question: "What is the difference between decimal, binary, octal and hexadecimal?",
    answer: "All four are number systems representing the same values differently: Decimal (base 10) uses digits 0–9 and is our everyday number system. Binary (base 2) uses only 0 and 1 — the language of computers. Octal (base 8) uses digits 0–7. Hexadecimal (base 16) uses digits 0–9 and letters A–F. The number 255 in decimal is 11111111 in binary, 377 in octal, and FF in hex."
  }
]

const VALID = {
  decimal: /^[0-9]*$/,
  binary: /^[01]*$/,
  octal: /^[0-7]*$/,
  hex: /^[0-9a-fA-F]*$/
}

const ERROR_MSGS = {
  binary: "Only 0 and 1 allowed in binary",
  octal: "Digits 0–7 only in octal",
  hex: "Digits 0–9 and A–F only in hex",
  decimal: "Only digits 0–9 allowed"
}

const HINTS = {
  decimal: "Digits: 0–9",
  binary: "Digits: 0, 1",
  octal: "Digits: 0–7",
  hex: "Digits: 0–9, A–F"
}

const MAX_SAFE = Number.MAX_SAFE_INTEGER
const REF_VALUES = [0, 1, 2, 4, 8, 10, 15, 16, 32, 64, 128, 255, 256, 512, 1024]

const formatBinary = (raw, format) => {
  if (format === 'raw') return raw
  const padded = raw.padStart(
    format === '4bit' ? Math.ceil(raw.length / 4) * 4 : Math.ceil(raw.length / 8) * 8,
    '0'
  )
  const groupSize = format === '4bit' ? 4 : 8
  return padded.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join(' ') || raw
}

const generateSteps = (dec) => {
  if (!dec || dec === 0) return []
  const steps = []

  const binSteps = []
  let n = dec
  while (n > 0) {
    binSteps.push({ dividend: n, quotient: Math.floor(n / 2), remainder: n % 2 })
    n = Math.floor(n / 2)
  }
  steps.push({
    title: `Decimal → Binary (÷ 2)`,
    lines: binSteps.map((s) => `${s.dividend} ÷ 2 = ${s.quotient}  remainder ${s.remainder}`),
    result: `Read bottom-to-top → ${dec.toString(2)}₂ ✓`
  })

  const hexSteps = []
  n = dec
  const hexChars = '0123456789ABCDEF'
  while (n > 0) {
    const rem = n % 16
    hexSteps.push({ dividend: n, quotient: Math.floor(n / 16), remainder: rem, remChar: hexChars[rem] })
    n = Math.floor(n / 16)
  }
  if (hexSteps.length > 0) {
    steps.push({
      title: `Decimal → Hex (÷ 16)`,
      lines: hexSteps.map((s) => `${s.dividend} ÷ 16 = ${s.quotient}  remainder ${s.remainder}${s.remainder >= 10 ? ' (' + s.remChar + ')' : ''}`),
      result: `Read bottom-to-top → ${dec.toString(16).toUpperCase()}₁₆ ✓`
    })
  }

  const octSteps = []
  n = dec
  while (n > 0) {
    octSteps.push({ dividend: n, quotient: Math.floor(n / 8), remainder: n % 8 })
    n = Math.floor(n / 8)
  }
  if (octSteps.length > 0) {
    steps.push({
      title: `Decimal → Octal (÷ 8)`,
      lines: octSteps.map((s) => `${s.dividend} ÷ 8 = ${s.quotient}  remainder ${s.remainder}`),
      result: `Read bottom-to-top → ${dec.toString(8)}₈ ✓`
    })
  }

  return steps
}

const textToAscii = (text) => {
  if (!text) return { hex: '', binary: '', decimal: '' }
  const chars = text.slice(0, 50).split('')
  return {
    hex: chars.map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' '),
    binary: chars.map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
    decimal: chars.map((c) => c.charCodeAt(0)).join(' ')
  }
}

const getHexColor = (hexVal) => {
  const clean = (hexVal || '').replace(/^0x/i, '')
  if (/^[0-9A-Fa-f]{3}$/.test(clean) || /^[0-9A-Fa-f]{6}$/.test(clean)) {
    return '#' + clean
  }
  return null
}

export default function BaseConverter() {
  const [decimal, setDecimal] = useState("255")
  const [binary, setBinary] = useState("")
  const [octal, setOctal] = useState("")
  const [hex, setHex] = useState("")
  const [activeInput, setActiveInput] = useState("decimal")
  const [errors, setErrors] = useState({})
  const [binaryFormat, setBinaryFormat] = useState("raw")
  const [showPrefix, setShowPrefix] = useState(false)
  const [customBase, setCustomBase] = useState(16)
  const [customValue, setCustomValue] = useState("")
  const [textInput, setTextInput] = useState("Hello")
  const [showSteps, setShowSteps] = useState(true)
  const [copiedField, setCopiedField] = useState("")
  const [currentDecimal, setCurrentDecimal] = useState(255)

  const convertFrom = (value, fromBase, field) => {
    if (!value) {
      setDecimal(""); setBinary("")
      setOctal(""); setHex("")
      setCustomValue(""); setCurrentDecimal(0)
      setErrors({})
      return
    }

    if (!VALID[field].test(value)) {
      setErrors({ [field]: ERROR_MSGS[field] })
      return
    }
    setErrors({})

    const dec = parseInt(value, fromBase)
    if (isNaN(dec)) return
    if (dec > MAX_SAFE) {
      setErrors({ [field]: `Too large. Max: ${MAX_SAFE.toLocaleString('en-IN')}` })
      return
    }

    setCurrentDecimal(dec)

    const rawBin = dec.toString(2)
    const formattedBin = formatBinary(rawBin, binaryFormat)
    const p = showPrefix

    if (field !== 'decimal') setDecimal(dec.toString(10))
    if (field !== 'binary') setBinary(p ? '0b' + formattedBin : formattedBin)
    if (field !== 'octal') setOctal(p ? '0o' + dec.toString(8) : dec.toString(8))
    if (field !== 'hex') setHex((p ? '0x' : '') + dec.toString(16).toUpperCase())

    const cb = parseInt(customBase)
    if (cb >= 2 && cb <= 36) {
      setCustomValue(dec.toString(cb).toUpperCase())
    }
  }

  useEffect(() => {
    convertFrom("255", 10, "decimal")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const setters = { decimal: setDecimal, binary: setBinary, octal: setOctal, hex: setHex }
  const bases = { decimal: 10, binary: 2, octal: 8, hex: 16 }
  const handleChange = (field) => (e) => {
    const v = field === 'hex' ? e.target.value.toUpperCase() : e.target.value
    setters[field](v)
    convertFrom(v, bases[field], field)
    setActiveInput(field)
  }

  const fillDecimal = (val) => {
    setDecimal(val.toString())
    convertFrom(val.toString(), 10, 'decimal')
    setActiveInput('decimal')
  }

  const handlePrefixToggle = (e) => {
    const next = e.target.checked
    setShowPrefix(next)
    const rawBin = currentDecimal.toString(2)
    const formattedBin = formatBinary(rawBin, binaryFormat)
    setBinary(next ? '0b' + formattedBin : formattedBin)
    setOctal(next ? '0o' + currentDecimal.toString(8) : currentDecimal.toString(8))
    setHex((next ? '0x' : '') + currentDecimal.toString(16).toUpperCase())
  }

  const handleBinaryFormatChange = (fmt) => {
    setBinaryFormat(fmt)
    const rawBin = currentDecimal.toString(2)
    const formatted = formatBinary(rawBin, fmt)
    setBinary(showPrefix ? '0b' + formatted : formatted)
  }

  const handleCustomBaseChange = (e) => {
    const val = e.target.value
    setCustomBase(val)
    const n = parseInt(val)
    if (n >= 2 && n <= 36) {
      setCustomValue(currentDecimal.toString(n).toUpperCase())
    } else {
      setCustomValue('')
    }
  }

  const hexColor = getHexColor(hex)
  const ascii = textToAscii(textInput)
  const steps = showSteps ? generateSteps(currentDecimal) : []

  let explanation
  if (currentDecimal === 255) {
    explanation = "The number 255 in decimal is 11111111 in binary — 8 bits, all set to 1. In hex it's FF, widely used in web colors (#FFFFFF = white, #FF0000 = red). In octal it's 377."
  } else if (currentDecimal === 0) {
    explanation = "Zero is represented identically in all bases: 0. It is the additive identity and the only number that is neither positive nor negative."
  } else if (currentDecimal > 0) {
    explanation = `The number ${currentDecimal} in decimal = ${currentDecimal.toString(2)} in binary (${currentDecimal.toString(2).length} bits), ${currentDecimal.toString(16).toUpperCase()} in hex, and ${currentDecimal.toString(8)} in octal.`
  } else {
    explanation = "Enter a value above to see a detailed breakdown of its representation in every base."
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 mb-6 block">
        ← All tools
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">Number Base Converter</h1>
        <p className="text-sm text-[#6b6b80]">
          Convert between Decimal, Binary, Octal and Hex simultaneously — with step-by-step explanation.
        </p>
      </div>

      {/* Main conversion card */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-[#6b6b80]">Quick Fill</span>
          {[255, 1024, 65535, 4096, 0].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => fillDecimal(val)}
              className="bg-[#1a1a24] text-[#f0f0f5] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 text-sm font-mono hover:border-[rgba(203,255,0,0.3)] hover:text-[#CBFF00] transition"
            >
              {val}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <ConversionBox
            label="DECIMAL" base={10} field="decimal" value={decimal}
            error={errors.decimal} activeInput={activeInput}
            onChange={handleChange('decimal')}
            copiedField={copiedField} onCopy={() => copyToClipboard(decimal, 'decimal')}
          />
          <ConversionBox
            label="HEXADECIMAL" base={16} field="hex" value={hex}
            error={errors.hex} activeInput={activeInput}
            onChange={handleChange('hex')}
            copiedField={copiedField} onCopy={() => copyToClipboard(hex, 'hex')}
            topRightExtra={hexColor && (
              <span className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.2)] inline-block" style={{ background: hexColor }}></span>
            )}
            bottomRightExtra={hexColor && (
              <span
                onClick={() => copyToClipboard(hexColor, 'csscolor')}
                className="text-[10px] text-[#CBFF00] cursor-pointer"
              >
                {copiedField === 'csscolor' ? '✓ Copied' : `CSS: ${hexColor}`}
              </span>
            )}
          />
          <ConversionBox
            label="BINARY" base={2} field="binary" value={binary}
            error={errors.binary} activeInput={activeInput}
            onChange={handleChange('binary')}
            copiedField={copiedField} onCopy={() => copyToClipboard(binary, 'binary')}
            bottomRightExtra={
              <div className="flex gap-1">
                {[{ id: 'raw', label: 'Raw' }, { id: '4bit', label: '4-bit' }, { id: '8bit', label: '8-bit' }].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleBinaryFormatChange(f.id)}
                    className={binaryFormat === f.id
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-full px-2 py-0.5 text-[10px]"
                      : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-full px-2 py-0.5 text-[10px]"}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          />
          <ConversionBox
            label="OCTAL" base={8} field="octal" value={octal}
            error={errors.octal} activeInput={activeInput}
            onChange={handleChange('octal')}
            copiedField={copiedField} onCopy={() => copyToClipboard(octal, 'octal')}
          />
        </div>

        <div className="flex justify-between items-center mt-4 mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showPrefix} onChange={handlePrefixToggle} className="accent-[#CBFF00]" />
            <span className="text-xs text-[#6b6b80]">Show prefixes (0b, 0o, 0x)</span>
          </label>
        </div>

        <div className="bg-[#0a0a0f] rounded-xl p-4 border border-[rgba(255,255,255,0.04)] mt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[10px] uppercase text-[#6b6b80]">Base N</span>
            <input
              type="number"
              min="2"
              max="36"
              value={customBase}
              onChange={handleCustomBaseChange}
              className="w-16 bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-[#f0f0f5] text-sm text-center outline-none focus:border-[#CBFF00] font-mono"
            />
            <span className="text-[#6b6b80]">→</span>
            <div className="flex-1 bg-[#1a1a24] rounded-xl px-4 py-2 font-mono text-[#CBFF00] text-lg">
              {customValue || "—"}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(customValue, 'custom')}
              className="text-[#6b6b80] hover:text-[#CBFF00] transition text-sm"
            >
              {copiedField === 'custom' ? '✓' : '📋'}
            </button>
            <span className="text-[10px] text-[#6b6b80]">Supports bases 2–36 (uses A–Z)</span>
          </div>
        </div>
      </div>

      {/* ASCII section */}
      <div className="bg-[#111118] rounded-2xl p-6 mb-6 border border-[rgba(255,255,255,0.06)]">
        <div className="flex justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-base font-medium text-[#f0f0f5]">🔤 ASCII / Text Conversion</p>
            <p className="text-xs text-[#6b6b80] mt-0.5">Convert text to character codes</p>
          </div>
          <div className="flex gap-2">
            {["A", "Hello", "abc", "255"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTextInput(p)}
                className={textInput === p
                  ? "bg-[#CBFF00] text-[#0a0a0f] rounded-full px-3 py-1 text-xs"
                  : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-full px-3 py-1 text-xs"}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] uppercase text-[#6b6b80] mb-2">Text Input (max 50 chars)</p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value.slice(0, 50))}
              rows={2}
              className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-base outline-none resize-none focus:border-[#CBFF00] font-mono"
              placeholder="Type text here..."
            />
            <p className="text-[10px] text-[#6b6b80] mt-1">{textInput.length}/50</p>
          </div>

          <div className="space-y-3">
            <AsciiRow label="HEX" value={ascii.hex} color="text-[#CBFF00]" copiedField={copiedField} onCopy={() => copyToClipboard(ascii.hex, 'asciihex')} field="asciihex" />
            <AsciiRow label="BINARY" value={ascii.binary} color="text-[#22c55e]" copiedField={copiedField} onCopy={() => copyToClipboard(ascii.binary, 'asciibin')} field="asciibin" />
            <AsciiRow label="DECIMAL" value={ascii.decimal} color="text-[#f0f0f5]" copiedField={copiedField} onCopy={() => copyToClipboard(ascii.decimal, 'asciidec')} field="asciidec" />
          </div>
        </div>
      </div>

      {/* Step-by-step section */}
      <div className="bg-[#0d1117] rounded-2xl border border-[rgba(255,255,255,0.06)] mb-6">
        <div
          className="p-5 flex justify-between cursor-pointer"
          onClick={() => setShowSteps((v) => !v)}
        >
          <div>
            <p className="text-sm font-medium text-[#f0f0f5]">📖 How was this calculated?</p>
            <p className="text-xs text-[#6b6b80] mt-0.5">Decimal → Binary, Hex, Octal</p>
          </div>
          <span className="text-[#CBFF00] text-sm">{showSteps ? "▾ Hide" : "▴ Show"}</span>
        </div>

        {showSteps && steps.map((section, si) => (
          <div key={si} className="p-5 border-t border-[rgba(255,255,255,0.04)] overflow-x-auto">
            <div className="text-[#CBFF00] text-xs font-mono font-semibold mb-3">{section.title}:</div>
            {section.lines.map((line, li) => {
              const marker = 'remainder '
              const idx = line.indexOf(marker)
              const before = idx >= 0 ? line.slice(0, idx + marker.length) : line
              const badgeText = idx >= 0 ? line.slice(idx + marker.length) : null
              return (
                <div key={li} className="flex items-center gap-3 text-xs font-mono text-[#22c55e] leading-7 whitespace-nowrap">
                  <span className="text-[#6b6b80] w-5 text-right flex-shrink-0">{li + 1}</span>
                  <span className="text-[#6b6b80]">›</span>
                  <span>
                    {before}
                    {badgeText && (
                      <span className="bg-[#CBFF00] text-[#0a0a0f] rounded px-1.5 py-0.5 text-[10px] font-bold ml-1">{badgeText}</span>
                    )}
                  </span>
                </div>
              )
            })}
            <div className="text-[#CBFF00] text-xs font-mono mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] font-semibold">
              › {section.result}
            </div>
          </div>
        ))}
      </div>

      {/* Reference table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#f0f0f5] mb-4">Common Conversions</h2>
        <div className="overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.06)]">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr>
                <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">DEC</th>
                <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">BIN</th>
                <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">OCT</th>
                <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">HEX</th>
              </tr>
            </thead>
            <tbody>
              {REF_VALUES.map((v, i) => {
                const isActive = v === currentDecimal
                return (
                  <tr
                    key={v}
                    onClick={() => fillDecimal(v)}
                    className={`cursor-pointer transition ${isActive ? 'bg-[rgba(203,255,0,0.08)]' : i % 2 === 1 ? 'bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(203,255,0,0.04)]' : 'hover:bg-[rgba(203,255,0,0.04)]'}`}
                  >
                    <td className={`px-4 py-3 ${isActive ? 'text-[#CBFF00] font-bold' : 'text-[#f0f0f5]'}`}>{v}</td>
                    <td className={`px-4 py-3 text-xs ${isActive ? 'text-[#CBFF00]' : 'text-[#6b6b80]'}`}>{v.toString(2)}</td>
                    <td className="px-4 py-3 text-[#6b6b80]">{v.toString(8)}</td>
                    <td className={`px-4 py-3 ${isActive ? 'text-[#CBFF00]' : 'text-[#f0f0f5]'}`}>{v.toString(16).toUpperCase()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#6b6b80] mt-2">Click a row to fill all boxes</p>
      </div>

      {/* What does this mean? */}
      <div className="border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.03)] rounded-r-2xl p-6 mb-6">
        <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">What does this mean?</h3>
        <p className="text-sm text-[#6b6b80] leading-relaxed">{explanation}</p>
      </div>

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>

      {/* SEO content */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-12 border border-[rgba(255,255,255,0.06)] space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is number base conversion?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Number base conversion is the process of representing the same number in different numeral systems. While we use base-10 (decimal) in everyday life, computers use base-2 (binary), programmers use base-16 (hexadecimal), and Unix systems use base-8 (octal).
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">Why do computers use binary?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Computers use binary because electronic circuits have two states — on (1) and off (0). Every piece of data, text, images, and video is ultimately stored and processed as a sequence of 0s and 1s at the hardware level.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">Where is hexadecimal used?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Hexadecimal is used in web colors (#FFFFFF for white), memory addresses in programming, MAC addresses in networking, and cryptographic hashes. One hex digit represents exactly 4 binary bits (a nibble), making it a compact representation of binary.
          </p>
        </div>
      </div>
    </div>
  )
}

function ConversionBox({ label, base, field, value, error, activeInput, onChange, copiedField, onCopy, topRightExtra, bottomRightExtra }) {
  return (
    <div className={`bg-[#1a1a24] rounded-2xl p-5 border transition-all duration-200 ${
      error
        ? 'border-[#ef4444] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
        : activeInput === field
        ? 'border-[rgba(203,255,0,0.4)]'
        : 'border-[rgba(255,255,255,0.06)]'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#CBFF00] font-medium">{label}</p>
          <p className="text-[10px] text-[#6b6b80] mt-0.5">Base {base}</p>
        </div>
        <div className="flex gap-2 items-center">
          {topRightExtra}
          <button type="button" onClick={onCopy} className="text-[#6b6b80] hover:text-[#CBFF00] transition text-sm">
            {copiedField === field ? '✓' : '📋'}
          </button>
        </div>
      </div>
      <input
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none font-mono text-3xl text-[#f0f0f5] placeholder-[#6b6b80]"
        placeholder="0"
        spellCheck={false}
      />
      <div className="flex justify-between items-center mt-3">
        {error ? (
          <span className="text-xs text-[#ef4444]">⚠️ {error}</span>
        ) : (
          <span className="text-[10px] text-[#6b6b80]">{HINTS[field]}</span>
        )}
        {bottomRightExtra}
      </div>
    </div>
  )
}

function AsciiRow({ label, value, color, copiedField, onCopy, field }) {
  return (
    <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] flex justify-between items-start gap-2">
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-[#6b6b80] mb-1">{label}</p>
        <p className={`text-xs font-mono break-all leading-relaxed ${color}`}>{value || "—"}</p>
      </div>
      <button type="button" onClick={onCopy} className="text-[#6b6b80] hover:text-[#CBFF00] transition text-sm flex-shrink-0">
        {copiedField === field ? '✓' : '📋'}
      </button>
    </div>
  )
}
