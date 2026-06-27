import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell } from "recharts"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "Which is better — Old Regime or New Regime for FY 2025-26?",
    answer: "It depends on your deductions. The New Regime offers lower slab rates (0% up to ₹4L, 5% up to ₹8L, 10% up to ₹12L etc.) but removes most deductions. The Old Regime has higher rates but allows 80C, 80D, HRA, and home loan deductions. If your total deductions exceed ₹3.75 lakh, the Old Regime is usually better. Use our calculator above to compare both instantly."
  },
  {
    question: "Is income up to ₹12 lakh tax-free in FY 2025-26?",
    answer: "Yes, effectively. Under the New Regime for FY 2025-26, the Section 87A rebate ensures zero tax liability for individuals with taxable income up to ₹12,00,000. For salaried employees, the ₹75,000 standard deduction means income up to ₹12,75,000 is effectively tax-free."
  },
  {
    question: "What is the standard deduction for salaried employees in FY 2025-26?",
    answer: "Salaried employees and pensioners get a standard deduction of ₹75,000 under the New Regime and ₹50,000 under the Old Regime for FY 2025-26. This deduction is automatically applied before calculating your taxable income — no proof or investment required."
  },
  {
    question: "What is Section 87A rebate?",
    answer: "Section 87A provides a full tax rebate to individuals with taxable income up to ₹5,00,000 (Old Regime) or ₹12,00,000 (New Regime) for FY 2025-26. If you qualify, your tax liability becomes zero even if your income falls within a taxable slab."
  },
  {
    question: "What are the New Regime tax slabs for FY 2025-26?",
    answer: "New Regime slabs for FY 2025-26: ₹0–₹4L at 0%, ₹4L–₹8L at 5%, ₹8L–₹12L at 10%, ₹12L–₹16L at 15%, ₹16L–₹20L at 20%, ₹20L–₹24L at 25%, and above ₹24L at 30%. A 4% health and education cess applies on the total tax."
  },
  {
    question: "What is surcharge on income tax?",
    answer: "Surcharge is an additional tax on individuals earning above ₹50 lakh annually. Rates: 10% for ₹50L–₹1Cr, 15% for ₹1Cr–₹2Cr, 25% for ₹2Cr–₹5Cr, and 25% (New Regime) or 37% (Old Regime) above ₹5Cr. Surcharge is applied on the base tax amount, and then 4% cess is applied on the total."
  }
]

const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.30 }
]

const OLD_REGIME_SLABS = {
  below60: [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  senior: [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  supersenior: [
    { min: 0, max: 500000, rate: 0 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ]
}

const SURCHARGE_SLABS = [
  { min: 5000000, max: 10000000, rate: 0.10 },
  { min: 10000000, max: 20000000, rate: 0.15 },
  { min: 20000000, max: 50000000, rate: 0.25 },
  { min: 50000000, max: Infinity, rateNew: 0.25, rateOld: 0.37 }
]

const fmt = (v) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(v || 0)

const calcSlabTax = (income, slabs) => {
  let tax = 0
  const breakdown = []
  for (const slab of slabs) {
    if (income <= slab.min) break
    const taxable = Math.min(income, slab.max) - slab.min
    const slabTax = taxable * slab.rate
    tax += slabTax
    breakdown.push({
      label: `₹${(slab.min / 100000).toFixed(0)}L – ${slab.max === Infinity ? 'Above' : '₹' + (slab.max / 100000).toFixed(0) + 'L'}`,
      rate: `${slab.rate * 100}%`,
      taxable,
      tax: slabTax
    })
  }
  return { tax, breakdown }
}

const calcSurcharge = (tax, income, regime) => {
  for (const s of [...SURCHARGE_SLABS].reverse()) {
    if (income > s.min) {
      const rate = regime === 'new' ? (s.rateNew || s.rate) : (s.rateOld || s.rate)
      return tax * rate
    }
  }
  return 0
}

function DeductionField({ label, max, value, onChange, hint, placeholder = "0" }) {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-xs text-[#6b6b80]">{label}</span>
        {max && <span className="text-xs text-[#6b6b80] opacity-60">{max}</span>}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[#f0f0f5] w-full outline-none focus:border-[rgba(203,255,0,0.4)] mt-1"
      />
      {hint && <p className="text-xs text-[#6b6b80] opacity-60 mt-1">{hint}</p>}
    </div>
  )
}

export default function IncomeTaxCalculator() {
  const [income, setIncome] = useState("")
  const [category, setCategory] = useState("below60")
  const [isSalaried, setIsSalaried] = useState(true)
  const [showDeductions, setShowDeductions] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showLegacy, setShowLegacy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deductions, setDeductions] = useState({
    section80C: "",
    section80D_self: "",
    section80D_parents: false,
    section80D_parentsSenior: false,
    hra: "",
    homeLoanInterest: "",
    nps80CCD: "",
    other: ""
  })
  const [result, setResult] = useState(null)
  const resultRef = useRef(null)

  const handleDeductionChange = (key, val) => {
    setDeductions((prev) => ({ ...prev, [key]: val }))
  }

  useEffect(() => {
    const gross = parseFloat(income)
    if (!gross || gross <= 0) {
      setResult(null)
      return
    }

    const stdNew = isSalaried ? 75000 : 0
    const stdOld = isSalaried ? 50000 : 0

    const d = deductions
    const d80C = Math.min(parseFloat(d.section80C) || 0, 150000)
    let d80D = Math.min(parseFloat(d.section80D_self) || 0,
      category === 'senior' || category === 'supersenior' ? 50000 : 25000)
    if (d.section80D_parents) {
      d80D += d.section80D_parentsSenior ? 50000 : 25000
    }
    const dHRA = parseFloat(d.hra) || 0
    const dHL = Math.min(parseFloat(d.homeLoanInterest) || 0, 200000)
    const dNPS = Math.min(parseFloat(d.nps80CCD) || 0, 50000)
    const dOther = parseFloat(d.other) || 0
    const totalOldDeductions = stdOld + d80C + d80D + dHRA + dHL + dNPS + dOther

    const taxableNew = Math.max(0, gross - stdNew)
    const taxableOld = Math.max(0, gross - totalOldDeductions)

    const { tax: baseNew, breakdown: newBreakdown } = calcSlabTax(taxableNew, NEW_REGIME_SLABS)
    const surchargeNew = calcSurcharge(baseNew, gross, 'new')
    const rebateNew = (category !== 'nri' && taxableNew <= 1200000) ? baseNew : 0
    const taxAfterRebateNew = Math.max(0, baseNew - rebateNew)
    const cessNew = (taxAfterRebateNew + surchargeNew) * 0.04
    const totalNew = taxAfterRebateNew + surchargeNew + cessNew
    const effectiveRateNew = ((totalNew / gross) * 100).toFixed(1)
    const monthlyInHandNew = (gross - totalNew) / 12

    const oldSlabs = category === 'supersenior'
      ? OLD_REGIME_SLABS.supersenior
      : category === 'senior' ? OLD_REGIME_SLABS.senior : OLD_REGIME_SLABS.below60
    const { tax: baseOld, breakdown: oldBreakdown } = calcSlabTax(taxableOld, oldSlabs)
    const surchargeOld = calcSurcharge(baseOld, gross, 'old')
    const rebateOld = (category !== 'nri' && taxableOld <= 500000) ? baseOld : 0
    const taxAfterRebateOld = Math.max(0, baseOld - rebateOld)
    const cessOld = (taxAfterRebateOld + surchargeOld) * 0.04
    const totalOld = taxAfterRebateOld + surchargeOld + cessOld
    const effectiveRateOld = ((totalOld / gross) * 100).toFixed(1)
    const monthlyInHandOld = (gross - totalOld) / 12

    const recommended = totalNew <= totalOld ? 'new' : 'old'
    const savings = Math.abs(totalNew - totalOld)
    const qualifies87A_new = category !== 'nri' && taxableNew <= 1200000
    const qualifies87A_old = category !== 'nri' && taxableOld <= 500000

    setResult({
      gross, taxableNew, taxableOld,
      new: {
        baseTax: baseNew, surcharge: surchargeNew,
        rebate: rebateNew, taxAfterRebate: taxAfterRebateNew,
        cess: cessNew, total: totalNew,
        effectiveRate: effectiveRateNew,
        monthlyInHand: monthlyInHandNew,
        breakdown: newBreakdown,
        stdDeduction: stdNew
      },
      old: {
        baseTax: baseOld, surcharge: surchargeOld,
        rebate: rebateOld, taxAfterRebate: taxAfterRebateOld,
        cess: cessOld, total: totalOld,
        effectiveRate: effectiveRateOld,
        monthlyInHand: monthlyInHandOld,
        breakdown: oldBreakdown,
        totalDeductions: totalOldDeductions,
        stdDeduction: stdOld
      },
      recommended, savings,
      qualifies87A_new, qualifies87A_old
    })

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }, [income, category, isSalaried, deductions])

  const handleCopy = () => {
    if (!result) return
    const text = `Income Tax FY 2025-26 — Toolra\n────────────────────────────────\nGross Income: ${fmt(result.gross)}\nTaxpayer: ${category} | Salaried: ${isSalaried}\n\nNEW REGIME:\nTax: ${fmt(result.new.total)} | Rate: ${result.new.effectiveRate}%\nIn-hand/month: ${fmt(result.new.monthlyInHand)}\n\nOLD REGIME:\nTax: ${fmt(result.old.total)} | Rate: ${result.old.effectiveRate}%\nIn-hand/month: ${fmt(result.old.monthlyInHand)}\n\n✅ Recommended: ${result.recommended} Regime\nSaves: ${fmt(result.savings)}/year\n────────────────────────────────\nCalculated on toolra.io`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waMessage = result
    ? `My income tax for FY 2025-26:\nIncome: ${fmt(result.gross)}\nNew Regime: ${fmt(result.new.total)}\nOld Regime: ${fmt(result.old.total)}\n${result.recommended} Regime saves ₹${fmt(result.savings)}/yr\nCalculated using Toolra 🔗 toolra.io`
    : ""
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  const renderRegimeCard = (label, data, regimeKey) => {
    const isRecommended = result.recommended === regimeKey
    return (
      <div className={`bg-[#1a1a24] rounded-2xl p-5 ${isRecommended ? 'border-2 border-[#CBFF00]' : 'border border-[rgba(255,255,255,0.06)]'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-[#6b6b80]">{label}</span>
          {isRecommended && (
            <span className="bg-[#CBFF00] text-[#0a0a0f] text-[10px] px-2 py-0.5 rounded-full">✅ Recommended</span>
          )}
        </div>
        <p className="text-3xl font-bold mb-1" style={{ color: isRecommended ? '#CBFF00' : '#f0f0f5' }}>
          {fmt(data.total)}
        </p>
        <p className="text-xs text-[#6b6b80] mb-3">Total Tax Liability</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#6b6b80]">
            <span>Tax before rebate</span>
            <span>{fmt(data.baseTax)}</span>
          </div>
          {data.rebate > 0 && (
            <div className="flex justify-between text-xs text-[#22c55e]">
              <span>87A rebate</span>
              <span>-{fmt(data.rebate)}</span>
            </div>
          )}
          {data.surcharge > 0 && (
            <div className="flex justify-between text-xs text-[#6b6b80]">
              <span>Surcharge</span>
              <span>{fmt(data.surcharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-[#6b6b80]">
            <span>Cess (4%)</span>
            <span>{fmt(data.cess)}</span>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.06)] my-2"></div>
          <div className="flex justify-between text-xs font-semibold text-[#f0f0f5]">
            <span>Total tax</span>
            <span>{fmt(data.total)}</span>
          </div>
        </div>
        <p className="text-xs text-[#6b6b80] mt-2">Effective rate: {data.effectiveRate}%</p>
        <p className="text-xs text-[#6b6b80]">In-hand/month: {fmt(data.monthlyInHand)}</p>
        {regimeKey === 'old' && (
          <p className="text-xs text-[#6b6b80]">Deductions: {fmt(data.totalDeductions)}</p>
        )}
      </div>
    )
  }

  const renderSlabColumn = (title, data) => (
    <div>
      <h4 className="text-sm font-semibold text-[#f0f0f5] mb-3">{title}</h4>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-[#6b6b80] pb-2 text-left">Slab</th>
            <th className="text-[#6b6b80] pb-2 text-left">Rate</th>
            <th className="text-[#6b6b80] pb-2 text-left">Tax</th>
          </tr>
        </thead>
        <tbody>
          {data.breakdown.map((row, i) => (
            <tr key={i}>
              <td className="text-[#f0f0f5] py-1.5">{row.label}</td>
              <td className="text-[#CBFF00] py-1.5">{row.rate}</td>
              <td className="text-[#f0f0f5] py-1.5 text-right">{fmt(row.tax)}</td>
            </tr>
          ))}
          <tr><td colSpan={3} className="py-1.5"></td></tr>
          <tr>
            <td className="text-[#6b6b80] py-1">Base tax</td>
            <td></td>
            <td className="text-[#f0f0f5] py-1 text-right">{fmt(data.baseTax)}</td>
          </tr>
          {data.rebate > 0 && (
            <tr className="text-[#22c55e]">
              <td className="py-1">87A rebate</td>
              <td></td>
              <td className="py-1 text-right">-{fmt(data.rebate)}</td>
            </tr>
          )}
          {data.surcharge > 0 && (
            <tr>
              <td className="text-[#6b6b80] py-1">Surcharge</td>
              <td></td>
              <td className="text-[#f0f0f5] py-1 text-right">{fmt(data.surcharge)}</td>
            </tr>
          )}
          <tr>
            <td className="text-[#6b6b80] py-1">Cess (4%)</td>
            <td></td>
            <td className="text-[#f0f0f5] py-1 text-right">{fmt(data.cess)}</td>
          </tr>
          <tr className="border-t border-[rgba(255,255,255,0.06)]">
            <td className="text-[#CBFF00] font-semibold py-1.5">Total tax</td>
            <td></td>
            <td className="text-[#CBFF00] font-semibold py-1.5 text-right">{fmt(data.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  const recData = result ? (result.recommended === 'new' ? result.new : result.old) : null
  const chartData = result ? [
    { name: 'In-hand', value: Math.max(0, result.gross - recData.total) },
    { name: 'Tax', value: recData.total }
  ] : []
  const DONUT_COLORS = ['#22c55e', '#CBFF00']

  const deductionsPct = result ? Math.min(100, (result.old.totalDeductions / result.gross) * 100) : 0

  let explanation = ""
  if (result) {
    if (result.qualifies87A_new) {
      explanation = `Great news! Your income of ${fmt(result.gross)} falls within the zero-tax zone under the New Regime. After the ₹75,000 standard deduction and Section 87A rebate, your total tax liability is ₹0. You keep ${fmt(result.gross)}/year entirely in-hand.`
    } else if (result.recommended === 'new') {
      explanation = `For your income of ${fmt(result.gross)}, the New Regime saves you ${fmt(result.savings)} compared to the Old Regime. Your effective tax rate is ${result.new.effectiveRate}%, leaving you with ${fmt(result.new.monthlyInHand)}/month.`
    } else {
      explanation = `Despite higher slab rates, the Old Regime is better for you because your deductions of ${fmt(result.old.totalDeductions)} significantly reduce your taxable income. You save ${fmt(result.savings)} compared to New Regime.`
    }
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 mb-6 block">
        ← All tools
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">Income Tax Calculator</h1>
          <p className="text-sm text-[#6b6b80]">
            Compare Old Regime vs New Regime for FY 2025-26 — find which saves you more tax.
          </p>
        </div>
        <span className="bg-[#CBFF00] text-[#0a0a0f] text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
          FY 2025-26
        </span>
      </div>

      {/* Taxpayer category */}
      <div className="mb-6">
        <span className="block text-sm font-medium text-[#f0f0f5] mb-3">Taxpayer category</span>
        <div className="grid grid-cols-4 gap-3">
          {[
            { key: 'below60', label: '👤 Below 60' },
            { key: 'senior', label: '🧓 Senior (60-80)' },
            { key: 'supersenior', label: '👴 Super Senior (80+)' },
            { key: 'nri', label: '✈️ NRI' }
          ].map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={category === c.key
                ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 font-medium"
                : "bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[#f0f0f5] rounded-xl py-2.5"}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Salaried checkbox */}
      <div className="flex items-start gap-3 mb-8">
        <input
          type="checkbox"
          id="isSalaried"
          checked={isSalaried}
          onChange={(e) => setIsSalaried(e.target.checked)}
          className="accent-[#CBFF00] w-4 h-4 mt-0.5"
        />
        <div>
          <label htmlFor="isSalaried" className="text-sm font-medium text-[#f0f0f5]">
            I am a salaried employee / pensioner
          </label>
          <p className="text-xs text-[#6b6b80] mt-1">
            Applies ₹75,000 standard deduction (New) and ₹50,000 (Old) automatically
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">
              Annual Gross Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b80] text-lg">₹</span>
              <input
                type="number"
                min="0"
                placeholder="e.g. 12,00,000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-4 text-2xl font-semibold text-[#f0f0f5] outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)] transition-all"
              />
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowDeductions((v) => !v)}
                className="text-sm text-[#CBFF00] cursor-pointer border border-[rgba(203,255,0,0.2)] rounded-xl px-4 py-3 w-full text-left bg-[rgba(203,255,0,0.04)] hover:bg-[rgba(203,255,0,0.08)] transition"
              >
                {showDeductions ? "▾ Deductions (Old Regime)" : "▸ Deductions (Old Regime)"}
              </button>

              {showDeductions && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <DeductionField
                    label="Section 80C"
                    max="₹1,50,000"
                    value={deductions.section80C}
                    onChange={(v) => handleDeductionChange('section80C', v)}
                    hint="PPF, ELSS, LIC, EPF"
                  />

                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#6b6b80]">Section 80D (Self)</span>
                      <span className="text-xs text-[#6b6b80] opacity-60">₹25,000</span>
                    </div>
                    <input
                      type="number"
                      value={deductions.section80D_self}
                      onChange={(e) => handleDeductionChange('section80D_self', e.target.value)}
                      placeholder="0"
                      className="bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[#f0f0f5] w-full outline-none focus:border-[rgba(203,255,0,0.4)] mt-1"
                    />
                    <label className="flex items-start gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={deductions.section80D_parents}
                        onChange={(e) => handleDeductionChange('section80D_parents', e.target.checked)}
                        className="accent-[#CBFF00] w-3.5 h-3.5 mt-0.5"
                      />
                      <span className="text-xs text-[#6b6b80]">
                        Include parents' health insurance? (+₹25,000 or ₹50,000 if senior)
                      </span>
                    </label>
                    {deductions.section80D_parents && (
                      <label className="flex items-start gap-2 mt-2 pl-5">
                        <input
                          type="checkbox"
                          checked={deductions.section80D_parentsSenior}
                          onChange={(e) => handleDeductionChange('section80D_parentsSenior', e.target.checked)}
                          className="accent-[#CBFF00] w-3.5 h-3.5 mt-0.5"
                        />
                        <span className="text-xs text-[#6b6b80]">Parents are senior citizens (60+)?</span>
                      </label>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#6b6b80]">HRA Exemption</span>
                    </div>
                    <input
                      type="number"
                      value={deductions.hra}
                      onChange={(e) => handleDeductionChange('hra', e.target.value)}
                      placeholder="0"
                      className="bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[#f0f0f5] w-full outline-none focus:border-[rgba(203,255,0,0.4)] mt-1"
                    />
                    <span className="text-xs text-[#CBFF00] opacity-70 mt-1 block">How to calculate HRA? →</span>
                  </div>

                  <DeductionField
                    label="Home Loan Interest (24b)"
                    max="₹2,00,000"
                    value={deductions.homeLoanInterest}
                    onChange={(v) => handleDeductionChange('homeLoanInterest', v)}
                  />

                  <DeductionField
                    label="NPS 80CCD(1B)"
                    max="₹50,000"
                    value={deductions.nps80CCD}
                    onChange={(v) => handleDeductionChange('nps80CCD', v)}
                  />

                  <DeductionField
                    label="Other (80E, 80G, 80TTA)"
                    max="free input"
                    value={deductions.other}
                    onChange={(v) => handleDeductionChange('other', v)}
                  />
                </div>
              )}

              {showDeductions && (
                <p className="text-xs text-[#6b6b80] mt-3 italic">Deductions apply to Old Regime only</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div ref={resultRef}>
            {!result && (
              <p className="text-sm text-[#6b6b80] text-center mt-12">
                Enter your annual income to compare both tax regimes
              </p>
            )}

            {result && (
              <>
                {result.qualifies87A_new && (
                  <div className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-[#22c55e]">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-[#22c55e]">Zero tax under New Regime!</p>
                        <p className="text-xs text-[#22c55e] opacity-80 mt-1">
                          Your income qualifies for full 87A rebate (≤₹12L taxable).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#6b6b80] mb-2">
                    <span>Income Breakdown</span>
                    <span className="text-[#f0f0f5]">{fmt(result.gross)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a1a24] relative overflow-hidden">
                    <div
                      className="absolute left-0 h-full rounded-full bg-[#333340]"
                      style={{ width: `${deductionsPct}%` }}
                    ></div>
                    <div
                      className="absolute h-full rounded-full bg-[#CBFF00]"
                      style={{ left: `${deductionsPct}%`, width: `${100 - deductionsPct}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-[#6b6b80]">
                      <span className="w-3 h-3 rounded-full inline-block mr-1 bg-[#333340]"></span>
                      Deductions
                    </span>
                    <span className="text-xs text-[#6b6b80]">
                      <span className="w-3 h-3 rounded-full inline-block mr-1 bg-[#CBFF00]"></span>
                      Taxable Base
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {renderRegimeCard("New Regime", result.new, "new")}
                  {renderRegimeCard("Old Regime", result.old, "old")}
                </div>

                <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.2)] rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#CBFF00]">
                        💰 {result.recommended === 'new' ? 'New' : 'Old'} Regime saves you {fmt(result.savings)} per year
                      </p>
                      <p className="text-xs text-[#6b6b80] mt-0.5">
                        compared to {result.recommended === 'new' ? 'Old' : 'New'} Regime
                      </p>
                    </div>
                    <span className="text-xl font-bold text-[#CBFF00]">{fmt(result.savings)}</span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <PieChart width={160} height={160}>
                      <Pie
                        data={chartData}
                        cx={80}
                        cy={80}
                        innerRadius={52}
                        outerRadius={72}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i]} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {recData.total === 0 ? (
                        <>
                          <span className="text-2xl font-bold text-[#22c55e]">0%</span>
                          <span className="text-xs text-[#6b6b80]">tax</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-[#CBFF00]">{recData.effectiveRate}%</span>
                          <span className="text-xs text-[#6b6b80]">eff. rate</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <span className="text-xs text-[#6b6b80]">
                      <span className="w-3 h-3 rounded-full inline-block mr-1 bg-[#22c55e]"></span>
                      In-hand {fmt(recData.monthlyInHand)}/mo
                    </span>
                    <span className="text-xs text-[#6b6b80]">
                      <span className="w-3 h-3 rounded-full inline-block mr-1 bg-[#CBFF00]"></span>
                      Tax {fmt(recData.total)}
                    </span>
                  </div>
                </div>

                <div className="border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.04)] rounded-r-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-[#f0f0f5] mb-1">
                    🔍 {result.recommended === 'new' ? 'New' : 'Old'} Regime optimization
                  </p>
                  <p className="text-xs text-[#6b6b80] leading-relaxed">
                    {result.recommended === 'new'
                      ? `The New Regime offers lower rates with a ₹75,000 standard deduction. Ideal if your investments and deductions total less than ${fmt(result.new.stdDeduction + 150000 + 50000)}.`
                      : `With your deductions of ${fmt(result.old.totalDeductions)}, the Old Regime reduces your taxable income significantly — making it the better choice for your profile.`}
                  </p>
                </div>

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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slab-wise breakdown */}
      {result && (
        <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] mb-6">
          <div
            className="p-5 flex justify-between cursor-pointer"
            onClick={() => setShowBreakdown((v) => !v)}
          >
            <span className="text-base font-medium text-[#f0f0f5]">Slab-wise breakdown</span>
            <span className="text-[#CBFF00] text-sm">{showBreakdown ? "Hide ▴" : "View ▾"}</span>
          </div>

          {showBreakdown && (
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-5 px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {renderSlabColumn("New Regime", result.new)}
                {renderSlabColumn("Old Regime", result.old)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reference tables */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#f0f0f5] mb-3">New Regime Slabs FY 2025-26</h3>
          <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-3 py-2.5 text-left">Income Range</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-3 py-2.5 text-left">Rate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: "₹0 – ₹4,00,000", rate: "0%" },
                  { range: "₹4,00,001 – ₹8,00,000", rate: "5%" },
                  { range: "₹8,00,001 – ₹12,00,000", rate: "10%" },
                  { range: "₹12,00,001 – ₹16,00,000", rate: "15%" },
                  { range: "₹16,00,001 – ₹20,00,000", rate: "20%" },
                  { range: "₹20,00,001 – ₹24,00,000", rate: "25%", highlight: true },
                  { range: "Above ₹24,00,000", rate: "30%" }
                ].map((row, i) => (
                  <tr key={i} className={row.highlight ? "bg-[rgba(203,255,0,0.08)]" : i % 2 === 0 ? "bg-[#111118]" : "bg-[rgba(255,255,255,0.02)]"}>
                    <td className="px-3 py-2 text-[#f0f0f5]">{row.range}</td>
                    <td className="px-3 py-2 text-[#f0f0f5]">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-[#6b6b80] mt-2 space-y-0.5">
            <p>• Standard deduction: ₹75,000 (salaried)</p>
            <p>• 87A rebate: zero tax up to ₹12L taxable</p>
            <p>• Surcharge capped at 25% under new regime</p>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#f0f0f5] mb-3">Old Regime Slabs</h3>
          <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-3 py-2.5 text-left">Income</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-3 py-2.5 text-left">&lt;60</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-3 py-2.5 text-left">Senior</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-3 py-2.5 text-left">Super Sr</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Up to ₹2.5L", "0%", "—", "—"],
                  ["Up to ₹3L", "—", "0%", "—"],
                  ["Up to ₹5L", "—", "—", "0%"],
                  ["₹2.5L–₹5L", "5%", "5%", "—"],
                  ["₹3L–₹5L", "—", "5%", "—"],
                  ["₹5L–₹10L", "20%", "20%", "20%"],
                  ["Above ₹10L", "30%", "30%", "30%"]
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-[#111118]" : "bg-[rgba(255,255,255,0.02)]"}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-[#f0f0f5]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-[#6b6b80] mt-2 space-y-0.5">
            <p>• Standard deduction: ₹50,000 (salaried)</p>
            <p>• 87A rebate: zero tax up to ₹5L taxable</p>
            <p>• Surcharge up to 37% for income &gt; ₹5Cr</p>
          </div>
        </div>
      </div>

      {/* What does this mean? */}
      {result && (
        <div className="border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.03)] rounded-r-2xl p-6 mb-6">
          <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">What does this mean?</h3>
          <p className="text-sm text-[#6b6b80] leading-relaxed">{explanation}</p>
        </div>
      )}

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>

      {/* SEO content */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-12 border border-[rgba(255,255,255,0.06)] space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">Old Regime vs New Regime — which is better?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            The New Regime offers lower slab rates (starting at 5% from ₹4L) but removes most deductions. The Old Regime has higher rates but allows deductions under 80C, 80D, HRA, and home loan interest. Generally, if your total deductions exceed ₹3.75 lakh, the Old Regime is more beneficial.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is Section 87A rebate?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Section 87A gives a full tax rebate to individuals with taxable income up to ₹5 lakh (Old Regime) or ₹12 lakh (New Regime for FY 2025-26). This means zero tax liability even if your income falls within a taxable slab — making the New Regime especially attractive for middle-income earners.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is standard deduction?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            A standard deduction of ₹50,000 is available under the Old Regime and ₹75,000 under the New Regime for salaried individuals and pensioners. It is automatically deducted from gross salary before calculating tax — no investment or expense proof required.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is surcharge on income tax?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Surcharge is an additional tax on individuals earning above ₹50 lakh annually. Rates range from 10% (₹50L–₹1Cr) to 25% (above ₹2Cr) under both regimes. Under the Old Regime, the rate goes up to 37% for income above ₹5 crore — capped at 25% under the New Regime.
          </p>
        </div>
      </div>
    </div>
  )
}
