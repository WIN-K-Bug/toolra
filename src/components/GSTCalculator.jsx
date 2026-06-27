import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "What is GST and how is it calculated?",
    answer: "GST (Goods and Services Tax) is India's unified indirect tax. To add GST: multiply the base price by (1 + GST rate). For example, ₹1,000 with 18% GST = ₹1,000 × 1.18 = ₹1,180. To remove GST from an inclusive price: divide by (1 + GST rate). Our calculator handles both instantly."
  },
  {
    question: "What are the GST 2.0 slabs effective September 2025?",
    answer: "Under GST 2.0 (effective September 22, 2025), India simplified its GST structure to three primary slabs: 5% for essential goods, 18% for most goods and services, and 40% for luxury and sin goods. The previous 12% and 28% slabs were largely abolished."
  },
  {
    question: "What is the difference between CGST, SGST and IGST?",
    answer: "For transactions within the same state (intra-state), GST is split equally into CGST (Central GST) and SGST (State GST). For transactions between states (inter-state), IGST (Integrated GST) applies as a single tax collected by the central government."
  },
  {
    question: "How do I calculate GST on a product price?",
    answer: "To add GST: Final price = Base price × (1 + GST%/100). To find the base price from a GST-inclusive amount: Base = Inclusive price ÷ (1 + GST%/100). Use our GST calculator above — enter the amount, select your GST slab, choose Add or Remove mode, and get instant results."
  },
  {
    question: "Which products fall under 0% GST?",
    answer: "Items with 0% GST include fresh vegetables, rice, wheat, milk, eggs, bread, salt, books, newspapers, and essential medicines. These are considered basic necessities and are exempt from GST to keep them affordable for all."
  },
  {
    question: "What is the GST rate on restaurant food?",
    answer: "Restaurant services attract 18% GST under GST 2.0. Previously, air-conditioned restaurants were taxed at 18% and non-AC at 5%, but the simplified structure now applies 18% broadly to restaurant services."
  }
]

const formatINR = (value) => {
  if (!value && value !== 0) return "—"
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const PRIMARY_RATES = [0, 5, 18, 40]
const LEGACY_RATES = [3, 12, 28]

const CURRENT_RATE_TABLE = [
  { rate: 0, cgst: "0%", sgst: "0%", igst: "0%", items: "Rice, milk, 33 lifesaving drugs, health insurance, fresh vegetables" },
  { rate: 5, cgst: "2.5%", sgst: "2.5%", igst: "5%", items: "Packaged food, edible oil, medicines, books, transport" },
  { rate: 18, cgst: "9%", sgst: "9%", igst: "18%", items: "Electronics, restaurants, clothing above ₹1,000, most services, appliances" },
  { rate: 40, cgst: "20%", sgst: "20%", igst: "40%", items: "Tobacco, luxury cars, aerated drinks, online gaming" }
]

const LEGACY_RATE_TABLE = [
  { rate: 3, cgst: "1.5%", sgst: "1.5%", igst: "3%", items: "Gold, silver, precious metals" },
  { rate: 12, cgst: "6%", sgst: "6%", igst: "12%", items: "Largely retired — most items moved to 5%" },
  { rate: 28, cgst: "14%", sgst: "14%", igst: "28%", items: "Largely retired — most items moved to 18% or 40%" }
]

export default function GSTCalculator() {
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [gstRate, setGstRate] = useState(18)
  const [transactionType, setTransactionType] = useState("intra")
  const [mode, setMode] = useState("add")
  const [showLegacy, setShowLegacy] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef(null)

  useEffect(() => {
    const val = parseFloat(amount)
    const qty = parseInt(quantity) || 1
    if (!amount || val <= 0) {
      setResult(null)
      return
    }

    const P = val * qty
    const rate = gstRate / 100
    let baseAmount, gstAmount, totalAmount

    if (mode === "add") {
      baseAmount = P
      gstAmount = P * rate
      totalAmount = P + gstAmount
    } else {
      totalAmount = P
      baseAmount = P / (1 + rate)
      gstAmount = totalAmount - baseAmount
    }

    const halfGST = gstAmount / 2
    const singleUnitBase = val

    setResult({
      baseAmount, gstAmount, totalAmount,
      halfGST, singleUnitBase,
      qty, rate: gstRate
    })

    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [amount, quantity, gstRate, mode, transactionType])

  const handleCopy = () => {
    if (!result) return
    const text = `GST Calculation — Toolra\n─────────────────────────\nAmount: ${formatINR(result.baseAmount)} × ${result.qty} unit(s)\nGST Rate: ${result.rate}% (GST 2.0)\nGST Amount: ${formatINR(result.gstAmount)}\nTotal: ${formatINR(result.totalAmount)}\n─────────────────────────\nCalculated on toolra.io`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waMessage = result
    ? `GST on ${formatINR(result.baseAmount)} × ${result.qty} units @ ${result.rate}% = ${formatINR(result.gstAmount)}\nTotal: ${formatINR(result.totalAmount)}\nCalculated using Toolra 🔗 toolra.io`
    : ""
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  let explanation
  if (result && mode === "add" && transactionType === "intra") {
    explanation = `You're adding ${result.rate}% GST to ${formatINR(result.baseAmount)}. The customer pays ${formatINR(result.totalAmount)} in total. Of that, ${formatINR(result.gstAmount)} goes to the government as tax — split equally as CGST of ${formatINR(result.halfGST)} and SGST of ${formatINR(result.halfGST)} for within-state sales.`
  } else if (result && mode === "add" && transactionType === "inter") {
    explanation = `You're adding ${result.rate}% GST to ${formatINR(result.baseAmount)}. The total is ${formatINR(result.totalAmount)}. Since this is an interstate transaction, ${formatINR(result.gstAmount)} is collected as IGST by the central government.`
  } else if (result && mode === "remove" && transactionType === "intra") {
    explanation = `The GST-inclusive price of ${formatINR(result.totalAmount)} contains ${formatINR(result.gstAmount)} as ${result.rate}% GST. The actual base price is ${formatINR(result.baseAmount)}. This is split as CGST ${formatINR(result.halfGST)} and SGST ${formatINR(result.halfGST)}.`
  } else if (result && mode === "remove" && transactionType === "inter") {
    explanation = `The GST-inclusive price of ${formatINR(result.totalAmount)} contains ${formatINR(result.gstAmount)} as IGST at ${result.rate}%. The actual base price before tax is ${formatINR(result.baseAmount)}.`
  } else {
    explanation = "Enter an amount above to see a plain-English explanation of your GST calculation."
  }

  const renderRateTable = (rows) => (
    <div className="overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.06)]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="w-20 bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Rate</th>
            <th className="w-20 bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">CGST</th>
            <th className="w-20 bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">SGST</th>
            <th className="w-20 bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">IGST</th>
            <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Common Items</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isActive = gstRate === row.rate
            const rowBg = isActive
              ? "bg-[rgba(203,255,0,0.06)]"
              : i % 2 === 0 ? "bg-[#111118]" : "bg-[rgba(203,255,0,0.02)]"
            return (
              <tr key={row.rate} className={rowBg}>
                <td className={`px-4 py-3 border-b border-[rgba(255,255,255,0.04)] ${isActive ? "text-[#CBFF00] font-bold" : "text-[#f0f0f5]"}`}>
                  {row.rate}%
                </td>
                <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{row.cgst}</td>
                <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{row.sgst}</td>
                <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{row.igst}</td>
                <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{row.items}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 py-3 block">
        ← All tools
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">GST Calculator</h1>
          <p className="text-sm text-[#6b6b80] max-w-lg">
            Add or remove GST from any amount — updated for GST 2.0 effective September 22, 2025.
          </p>
        </div>
        <span className="bg-[#CBFF00] text-[#0a0a0f] text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
          GST 2.0 · Sep 2025
        </span>
      </div>

      {/* Main tool card */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-3xl p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            {/* Amount */}
            <label htmlFor="gst-amount" className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b80] text-lg">₹</span>
              <input
                id="gst-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-4 text-2xl font-semibold text-[#f0f0f5] placeholder-[#6b6b80] outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)] transition-all"
              />
            </div>

            {/* Quantity */}
            <div className="mt-4">
              <label htmlFor="gst-quantity" className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-1">
                Quantity
              </label>
              <p className="text-xs text-[#6b6b80] opacity-60 mb-2">
                Multiply amount by units before GST
              </p>
              <input
                id="gst-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-base font-semibold text-[#f0f0f5] placeholder-[#6b6b80] outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)] transition-all"
              />
            </div>

            {/* GST Rate */}
            <div className="mt-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6b6b80] uppercase tracking-widest">GST Rate</span>
                <span className="bg-[rgba(203,255,0,0.12)] text-[#CBFF00] text-[10px] px-2 py-0.5 rounded-full border border-[rgba(203,255,0,0.25)]">
                  GST 2.0
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-2">
                {PRIMARY_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGstRate(rate)}
                    className={
                      gstRate === rate
                        ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-3 font-semibold text-sm border-none"
                        : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-3 font-semibold text-sm hover:border-[rgba(203,255,0,0.3)] transition-all"
                    }
                  >
                    {rate}%
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowLegacy((v) => !v)}
                className="text-xs text-[#6b6b80] hover:text-[#CBFF00] cursor-pointer transition-colors mt-2"
              >
                {showLegacy ? "Hide legacy rates ▴" : "Show legacy rates ▾"}
              </button>

              {showLegacy && (
                <div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {LEGACY_RATES.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setGstRate(rate)}
                        className={
                          gstRate === rate
                            ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2 font-semibold text-xs border-none"
                            : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] opacity-80 rounded-xl py-2 font-semibold text-xs hover:border-[rgba(203,255,0,0.3)] transition-all"
                        }
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#6b6b80] mt-2 leading-relaxed">
                    ⚠️ These slabs applied before September 22, 2025. 3% applies to gold and precious metals.
                  </p>
                </div>
              )}
            </div>

            {/* Transaction type */}
            <div className="mt-6">
              <span className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">
                Transaction type
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType("intra")}
                  className={
                    transactionType === "intra"
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 font-semibold text-sm border-none"
                      : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-2.5 font-semibold text-sm hover:border-[rgba(203,255,0,0.3)] transition-all"
                  }
                >
                  🏠 Within state
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("inter")}
                  className={
                    transactionType === "inter"
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 font-semibold text-sm border-none"
                      : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-2.5 font-semibold text-sm hover:border-[rgba(203,255,0,0.3)] transition-all"
                  }
                >
                  🚚 Between states
                </button>
              </div>
            </div>

            {/* Mode */}
            <div className="mt-4">
              <span className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">
                Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={
                    mode === "add"
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 font-semibold text-sm border-none"
                      : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-2.5 font-semibold text-sm hover:border-[rgba(203,255,0,0.3)] transition-all"
                  }
                >
                  Add GST
                </button>
                <button
                  type="button"
                  onClick={() => setMode("remove")}
                  className={
                    mode === "remove"
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 font-semibold text-sm border-none"
                      : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-2.5 font-semibold text-sm hover:border-[rgba(203,255,0,0.3)] transition-all"
                  }
                >
                  Remove GST
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div ref={resultRef}>
            {/* Hero result */}
            <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 text-center mb-4">
              <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">
                Total Amount
              </p>
              <p className="text-5xl font-bold text-[#CBFF00] mb-1">
                {result ? formatINR(result.totalAmount) : "₹0.00"}
              </p>
              <p className="text-xs text-[#6b6b80]">
                {result
                  ? `Based on ${formatINR(result.baseAmount)} + ${gstRate}% GST`
                  : "Enter an amount to calculate"}
              </p>
            </div>

            {/* Base / GST boxes */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#1a1a24] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                <p className="text-xs text-[#6b6b80] mb-1">Base Amount</p>
                <p className="text-xl font-semibold text-[#f0f0f5]">{formatINR(result?.baseAmount)}</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                <p className="text-xs text-[#6b6b80] mb-1">GST Amount</p>
                <p className="text-xl font-semibold text-[#f0f0f5]">{formatINR(result?.gstAmount)}</p>
              </div>
            </div>

            {/* Tax breakdown */}
            <div className="bg-[#0a0a0f] rounded-xl p-4 border border-[rgba(255,255,255,0.06)] mb-4">
              <h3 className="text-sm font-medium text-[#f0f0f5] mb-3">Tax breakdown</h3>

              {result && result.qty > 1 && (
                <div className="text-xs text-[#6b6b80] mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                  Qty: {result.qty} × {formatINR(result.singleUnitBase)} = {formatINR(result.baseAmount)}
                </div>
              )}

              {transactionType === "intra" ? (
                <>
                  <div className="flex justify-between items-center text-sm text-[#6b6b80] mb-2">
                    <span>CGST ({gstRate / 2}%)</span>
                    <span>{formatINR(result?.halfGST)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-[#6b6b80] mb-2">
                    <span>SGST ({gstRate / 2}%)</span>
                    <span>{formatINR(result?.halfGST)}</span>
                  </div>
                  <div className="border-t border-[rgba(255,255,255,0.06)] my-2"></div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-[#f0f0f5]">Total GST ({gstRate}%)</span>
                    <span className="text-[#CBFF00] font-semibold">{formatINR(result?.gstAmount)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-[#f0f0f5]">IGST ({gstRate}%)</span>
                    <span className="text-[#CBFF00] font-semibold">{formatINR(result?.gstAmount)}</span>
                  </div>
                  <p className="text-xs text-[#6b6b80] mt-2">IGST applies to interstate transactions</p>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="border border-[rgba(203,255,0,0.35)] text-[#CBFF00] bg-transparent rounded-xl py-2.5 text-sm font-medium hover:bg-[rgba(203,255,0,0.06)] transition"
              >
                {copied ? "✓ Copied!" : "📋 Copy result"}
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (!result) e.preventDefault() }}
                className="bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition flex items-center justify-center"
              >
                💬 Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* What does this mean? */}
      <div className="mt-8 mb-8 border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.03)] rounded-r-2xl p-6">
        <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">What does this mean?</h3>
        <p className="text-sm text-[#6b6b80] leading-relaxed">{explanation}</p>
      </div>

      {/* GST 2.0 reference table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#f0f0f5]">GST 2.0 Rate Reference</h2>
          <span className="bg-[#CBFF00] text-[#0a0a0f] text-xs font-semibold px-3 py-1 rounded-full">
            Updated Sep 2025
          </span>
        </div>

        {renderRateTable(CURRENT_RATE_TABLE)}

        <button
          type="button"
          onClick={() => setShowLegacy((v) => !v)}
          className="text-sm text-[#6b6b80] cursor-pointer hover:text-[#CBFF00] transition-colors mt-4"
        >
          {showLegacy ? "Hide legacy rates (before Sep 2025) ▴" : "Show legacy rates (before Sep 2025) ▾"}
        </button>

        {showLegacy && (
          <div className="mt-3 opacity-80">
            {renderRateTable(LEGACY_RATE_TABLE)}
            <p className="text-xs text-[#6b6b80] mt-3">
              ⚠️ Legacy rates apply to transactions before September 22, 2025 only.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>

      {/* SEO content */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-12 border border-[rgba(255,255,255,0.06)] space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is GST 2.0?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            GST 2.0 is the revised Goods and Services Tax structure implemented on September 22, 2025. It simplifies the previous multi-tier system (0%, 5%, 12%, 18%, 28%) into four primary slabs: 0%, 5%, 18%, and 40%. This reduces classification disputes, lowers costs on essentials, and makes compliance easier for businesses across India.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is CGST and SGST?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            For intra-state sales (within the same state), GST is split equally into CGST (Central GST) collected by the central government, and SGST (State GST) collected by the state. For inter-state transactions, IGST (Integrated GST) applies instead — collected entirely by the central government and then shared with states.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How to calculate GST?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            To add GST: Total = Base Amount × (1 + Rate). For example, ₹1,000 at 18% GST = ₹1,180. To remove GST from an inclusive price: Base = Total ÷ (1 + Rate). So ₹1,180 ÷ 1.18 = ₹1,000. Our calculator handles both instantly and updates in real time as you type.
          </p>
        </div>
      </div>
    </div>
  )
}
