import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell } from "recharts"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "What is EMI and how is it calculated?",
    answer: "EMI (Equated Monthly Installment) is the fixed monthly payment you make to repay a loan. The formula is: EMI = P × r × (1+r)^n ÷ ((1+r)^n - 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly installments."
  },
  {
    question: "What is the EMI for a ₹50 lakh home loan at 8.5% for 20 years?",
    answer: "For a ₹50,00,000 home loan at 8.5% annual interest for 20 years (240 months), the EMI works out to approximately ₹43,391 per month. The total amount paid over 20 years would be around ₹1.04 crore, of which ₹54.1 lakh is interest."
  },
  {
    question: "How can I reduce my EMI?",
    answer: "You can reduce your EMI by: (1) choosing a longer loan tenure — spreading payments reduces each installment, (2) making a larger down payment to reduce the principal, (3) negotiating a lower interest rate with your bank, or (4) making part-prepayments during the loan period to reduce outstanding principal."
  },
  {
    question: "What is the difference between flat rate and reducing balance EMI?",
    answer: "In a flat rate loan, interest is calculated on the original principal throughout the tenure. In a reducing balance loan (more common in India), interest is calculated on the outstanding principal, which decreases each month as you repay. Reducing balance results in lower effective interest costs."
  },
  {
    question: "Does prepaying a loan reduce EMI or tenure?",
    answer: "When you make a prepayment, banks typically give you two options: reduce the EMI amount while keeping the tenure same, or keep the EMI same and reduce the loan tenure. Reducing the tenure saves more interest in the long run."
  },
  {
    question: "What is a good EMI to salary ratio?",
    answer: "Financial experts recommend keeping your total EMI obligations below 40-50% of your monthly take-home salary. So if your in-hand salary is ₹1 lakh, your total EMIs (including home loan, car loan, personal loan) should not exceed ₹40,000-₹50,000 per month."
  }
]

const formatINR = (v) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(v)

const formatINR2 = (v) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(v)

const LOAN_TYPES = {
  home: {
    label: "🏠 Home Loan",
    rate: 8.5,
    hint: "Typical: 8.5%–9.5% p.a.",
    maxAmount: 10000000,
    defaultAmount: 5000000,
    defaultTenure: 20
  },
  car: {
    label: "🚗 Car Loan",
    rate: 9.5,
    hint: "Typical: 9.0%–11.0% p.a.",
    maxAmount: 5000000,
    defaultAmount: 800000,
    defaultTenure: 7
  },
  personal: {
    label: "💼 Personal",
    rate: 14,
    hint: "Typical: 11.0%–18.0% p.a.",
    maxAmount: 2000000,
    defaultAmount: 500000,
    defaultTenure: 5
  },
  education: {
    label: "🎓 Education",
    rate: 10,
    hint: "Typical: 8.0%–13.0% p.a.",
    maxAmount: 3000000,
    defaultAmount: 1000000,
    defaultTenure: 10
  }
}

const COLORS = ['#2a2a35', '#CBFF00']

function SyncedSlider({ value, onChange, min, max, step, leftLabel, rightLabel }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: `linear-gradient(to right, #CBFF00 ${pct}%, #2a2a35 ${pct}%)` }}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#CBFF00]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-[#0a0a0f]"
      />
      <div className="flex justify-between text-xs text-[#6b6b80] mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

export default function EMICalculator() {
  const [calcMode, setCalcMode] = useState("emi")
  const [loanType, setLoanType] = useState("home")
  const [principal, setPrincipal] = useState(5000000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)
  const [tenureType, setTenureType] = useState("years")
  const [processingFee, setProcessingFee] = useState(0)
  const [showFee, setShowFee] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleView, setScheduleView] = useState("yearly")
  const [emiInput, setEmiInput] = useState("")
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef(null)

  useEffect(() => {
    const n = tenureType === "years" ? tenure * 12 : tenure
    const r = rate / 100 / 12
    const P = parseFloat(principal)

    if (calcMode === "emi") {
      if (!P || !rate || !tenure) {
        setResult(null)
        return
      }
      const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      const totalPayment = emi * n
      const totalInterest = totalPayment - P
      const interestPct = ((totalInterest / P) * 100).toFixed(1)
      const trueCost = totalPayment + parseFloat(processingFee || 0)

      const yearlySchedule = []
      let balance = P
      const totalYears = Math.ceil(n / 12)
      for (let y = 1; y <= totalYears; y++) {
        let yPrincipal = 0, yInterest = 0
        const monthsThisYear = Math.min(12, n - (y - 1) * 12)
        for (let m = 0; m < monthsThisYear; m++) {
          const iAmt = balance * r
          const pAmt = emi - iAmt
          yInterest += iAmt
          yPrincipal += pAmt
          balance = Math.max(0, balance - pAmt)
        }
        yearlySchedule.push({
          year: y,
          principal: yPrincipal,
          interest: yInterest,
          balance: Math.max(0, balance)
        })
      }

      const monthlySchedule = []
      let bal2 = P
      for (let m = 1; m <= Math.min(n, 24); m++) {
        const iAmt = bal2 * r
        const pAmt = emi - iAmt
        bal2 = Math.max(0, bal2 - pAmt)
        monthlySchedule.push({
          month: m, principal: pAmt,
          interest: iAmt, balance: bal2
        })
      }

      setResult({
        emi, totalPayment, totalInterest,
        interestPct, trueCost, n,
        yearlySchedule, monthlySchedule,
        principal: P
      })
    } else {
      const emi = parseFloat(emiInput)
      if (!emi || !rate || !tenure) {
        setResult(null)
        return
      }
      const maxLoan = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))
      setResult({ maxLoan, emi, n })
    }

    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [principal, rate, tenure, tenureType, processingFee, calcMode, emiInput])

  const handleLoanTypeClick = (type) => {
    setLoanType(type)
    setRate(LOAN_TYPES[type].rate)
    setPrincipal(LOAN_TYPES[type].defaultAmount)
    setTenure(LOAN_TYPES[type].defaultTenure)
  }

  const handleCopy = () => {
    if (!result || calcMode !== "emi") return
    const text = `EMI Calculation — Toolra\n─────────────────────────\nLoan: ${loanType} | ${formatINR(principal)}\nRate: ${rate}% p.a. | Tenure: ${tenure} ${tenureType}\nMonthly EMI: ${formatINR(result.emi)}\nTotal Interest: ${formatINR(result.totalInterest)}\nTotal Payment: ${formatINR(result.totalPayment)}\n─────────────────────────\nCalculated on toolra.io`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waMessage = (result && calcMode === "emi")
    ? `EMI for ${formatINR(principal)} ${loanType} loan @ ${rate}% for ${tenure} ${tenureType} = ${formatINR(result.emi)}/month | Interest: ${formatINR(result.totalInterest)} | Total: ${formatINR(result.totalPayment)} via Toolra 🔗 toolra.io`
    : ""
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  const renderRateSection = () => (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#6b6b80] uppercase tracking-widest">Interest Rate</span>
        <span className="text-xs text-[#CBFF00] opacity-70">{LOAN_TYPES[loanType].hint}</span>
      </div>
      <div className="relative mb-2">
        <input
          type="number"
          min="1"
          max="30"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 pr-10 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">%</span>
      </div>
      <SyncedSlider value={Number(rate) || 0} onChange={setRate} min={1} max={30} step={0.1} leftLabel="1%" rightLabel="30%" />
    </div>
  )

  const renderTenureSection = () => (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#6b6b80] uppercase tracking-widest">Loan Tenure</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTenureType("years")}
            className={tenureType === "years"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-full px-3 py-1 text-xs font-semibold"
              : "bg-[#1a1a24] text-[#6b6b80] rounded-full px-3 py-1 text-xs font-semibold"}
          >
            Yr
          </button>
          <button
            type="button"
            onClick={() => setTenureType("months")}
            className={tenureType === "months"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-full px-3 py-1 text-xs font-semibold"
              : "bg-[#1a1a24] text-[#6b6b80] rounded-full px-3 py-1 text-xs font-semibold"}
          >
            Mo
          </button>
        </div>
      </div>
      <input
        type="number"
        min="1"
        step="1"
        value={tenure}
        onChange={(e) => setTenure(e.target.value)}
        className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all mb-2"
      />
      <SyncedSlider
        value={Number(tenure) || 0}
        onChange={setTenure}
        min={1}
        max={tenureType === "years" ? 30 : 360}
        step={1}
        leftLabel={tenureType === "years" ? "1 Yr" : "1 Mo"}
        rightLabel={tenureType === "years" ? "30 Yrs" : "360 Mo"}
      />
    </div>
  )

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 mb-6 block">
        ← All tools
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">EMI Calculator</h1>
          <p className="text-sm text-[#6b6b80]">
            Calculate your monthly loan repayment for home, car, personal or education loans
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCalcMode("emi")}
            className={calcMode === "emi"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
              : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
          >
            Calculate EMI
          </button>
          <button
            type="button"
            onClick={() => setCalcMode("borrow")}
            className={calcMode === "borrow"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
              : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
          >
            How much can I borrow?
          </button>
        </div>
      </div>

      {/* Loan type buttons */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(LOAN_TYPES).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleLoanTypeClick(key)}
            className={loanType === key
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-2xl py-3 text-sm font-medium"
              : "bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[#f0f0f5] rounded-2xl py-3 text-sm font-medium hover:border-[rgba(203,255,0,0.3)] transition-all"}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: inputs */}
          <div>
            {calcMode === "emi" ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-[#6b6b80] uppercase tracking-widest">Loan Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b80]">₹</span>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="w-40 bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl pl-7 pr-3 py-3 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
                    />
                  </div>
                </div>
                <SyncedSlider
                  value={Number(principal) || 0}
                  onChange={setPrincipal}
                  min={10000}
                  max={10000000}
                  step={10000}
                  leftLabel="₹10K"
                  rightLabel="₹1 Cr"
                />

                {renderRateSection()}
                {renderTenureSection()}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFee((v) => !v)}
                    className="text-xs text-[#CBFF00] cursor-pointer"
                  >
                    {showFee ? "▴ Advanced Settings (Processing Fee)" : "▾ Advanced Settings (Processing Fee)"}
                  </button>
                  {showFee && (
                    <div className="mt-2">
                      <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">
                        Processing Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={processingFee}
                        onChange={(e) => setProcessingFee(e.target.value)}
                        className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] font-semibold outline-none focus:border-[#CBFF00] transition-all"
                      />
                      <p className="text-xs text-[#6b6b80] mt-1">Added to true cost of borrowing</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-[#6b6b80] uppercase tracking-widest">Monthly EMI Budget (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b80]">₹</span>
                    <input
                      type="number"
                      value={emiInput}
                      onChange={(e) => setEmiInput(e.target.value)}
                      placeholder="0"
                      className="w-40 bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl pl-7 pr-3 py-3 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
                    />
                  </div>
                </div>
                <SyncedSlider
                  value={Number(emiInput) || 0}
                  onChange={setEmiInput}
                  min={1000}
                  max={500000}
                  step={1000}
                  leftLabel="₹1K"
                  rightLabel="₹5L"
                />

                {renderRateSection()}
                {renderTenureSection()}
              </>
            )}
          </div>

          {/* Right: results */}
          <div ref={resultRef}>
            {calcMode === "emi" && result && (
              <>
                <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 text-center mb-4">
                  <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">Monthly EMI</p>
                  <p className="text-5xl font-bold text-[#CBFF00] mb-1">{formatINR(result.emi)}</p>
                  <p className="text-xs text-[#6b6b80]">for {result.n} months</p>
                </div>

                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <PieChart width={180} height={180}>
                      <Pie
                        data={[
                          { name: 'Principal', value: result.principal },
                          { name: 'Interest', value: result.totalInterest }
                        ]}
                        cx={90}
                        cy={90}
                        innerRadius={60}
                        outerRadius={85}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {[0, 1].map((i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#CBFF00]">{result.interestPct}%</span>
                      <span className="text-xs text-[#6b6b80]">interest</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 mt-2">
                    <span className="text-xs text-[#6b6b80]">
                      <span className="w-3 h-3 rounded-full inline-block mr-1 bg-[#2a2a35] border border-[#6b6b80]"></span>
                      Principal
                      <span className="text-xs text-[#f0f0f5] font-medium ml-1">{formatINR(result.principal)}</span>
                    </span>
                    <span className="text-xs text-[#6b6b80]">
                      <span className="w-3 h-3 rounded-full inline-block mr-1 bg-[#CBFF00]"></span>
                      Interest
                      <span className="text-xs text-[#f0f0f5] font-medium ml-1">{formatINR(result.totalInterest)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Total Interest</p>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{formatINR(result.totalInterest)}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Total Payment</p>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{formatINR(result.totalPayment)}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">True Cost</p>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{formatINR(result.trueCost)}</p>
                  </div>
                </div>

                <div className="bg-[rgba(203,255,0,0.05)] border border-[rgba(203,255,0,0.15)] rounded-xl p-4 mb-4">
                  <p className="text-sm text-[#6b6b80] leading-relaxed">
                    💡 You pay {result.interestPct}% extra as interest. For every ₹100 borrowed, you repay ₹{(100 + parseFloat(result.interestPct)).toFixed(0)}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="border border-[rgba(203,255,0,0.35)] text-[#CBFF00] bg-transparent rounded-xl py-2.5 text-sm font-medium hover:bg-[rgba(203,255,0,0.06)] transition"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
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

            {calcMode === "borrow" && result && (
              <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 text-center mb-4">
                <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">Maximum Loan Amount</p>
                <p className="text-5xl font-bold text-[#CBFF00] mb-1">{formatINR(result.maxLoan)}</p>
                <p className="text-xs text-[#6b6b80]">at {rate}% for {tenure} {tenureType}</p>
              </div>
            )}

            {!result && (
              <p className="text-sm text-[#6b6b80] text-center mt-12">
                Enter valid loan details to see results
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Amortization schedule */}
      {calcMode === "emi" && result?.yearlySchedule && (
        <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] mb-8">
          <div
            className="flex justify-between items-center p-5 cursor-pointer"
            onClick={() => setShowSchedule((v) => !v)}
          >
            <span className="text-base font-medium text-[#f0f0f5]">📅 View Payment Schedule</span>
            <span className="text-[#CBFF00]">{showSchedule ? "▴" : "▾"}</span>
          </div>

          {showSchedule && (
            <div className="border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex gap-4 p-4 pb-0">
                <button
                  type="button"
                  onClick={() => setScheduleView("yearly")}
                  className={scheduleView === "yearly"
                    ? "text-[#CBFF00] border-b-2 border-[#CBFF00] pb-2 text-sm font-medium"
                    : "text-[#6b6b80] pb-2 text-sm"}
                >
                  Year-wise
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView("monthly")}
                  className={scheduleView === "monthly"
                    ? "text-[#CBFF00] border-b-2 border-[#CBFF00] pb-2 text-sm font-medium"
                    : "text-[#6b6b80] pb-2 text-sm"}
                >
                  Month-wise
                </button>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">
                        {scheduleView === "yearly" ? "Year" : "Month"}
                      </th>
                      <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Principal</th>
                      <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Interest</th>
                      <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(scheduleView === "yearly" ? result.yearlySchedule : result.monthlySchedule).map((row, i) => {
                      const isPaidOff = row.balance < 1
                      const rowBg = isPaidOff
                        ? "bg-[rgba(203,255,0,0.06)] font-semibold"
                        : i % 2 === 0 ? "bg-[#111118]" : "bg-[rgba(203,255,0,0.02)]"
                      return (
                        <tr key={i} className={rowBg}>
                          <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">
                            {scheduleView === "yearly" ? row.year : row.month}
                          </td>
                          <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{formatINR(row.principal)}</td>
                          <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{formatINR(row.interest)}</td>
                          <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{formatINR(row.balance)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {scheduleView === "monthly" && (
                  <p className="text-xs text-[#6b6b80] p-3">(Showing first 24 months)</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* What does this mean? */}
      {calcMode === "emi" && result && (
        <div className="border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.03)] rounded-r-2xl p-6 mb-8">
          <h3 className="text-base font-semibold text-[#f0f0f5] mb-3">What does this mean?</h3>
          <p className="text-sm text-[#6b6b80] leading-relaxed mb-4">
            By taking a {loanType} loan of {formatINR(result.principal)} at {rate}% for {tenure} {tenureType}, your monthly commitment is {formatINR(result.emi)}.
          </p>
          <div className="bg-[rgba(203,255,0,0.05)] rounded-xl p-4 border-l-2 border-[#CBFF00] mt-3">
            <p className="text-sm text-[#6b6b80] leading-relaxed">
              💡 Insight: You will pay back {formatINR(result.totalPayment)} in total — {formatINR(result.totalInterest)} more than you borrowed. The interest component is {result.interestPct}% of your principal. Consider prepaying early to reduce this significantly.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>

      {/* SEO content */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-12 border border-[rgba(255,255,255,0.06)] space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is EMI?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            EMI stands for Equated Monthly Installment — the fixed amount you pay your lender every month. Each EMI has two parts: principal repayment and interest. In early months, most of your EMI goes toward interest. As time passes, more goes toward the principal.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How is EMI calculated?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            EMI = P × r × (1+r)^n ÷ ((1+r)^n - 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly installments. Our calculator applies this formula instantly as you adjust any input.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How to reduce your EMI?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            You can reduce your EMI by choosing a longer tenure (lowers monthly payment but increases total interest), making a larger down payment, negotiating a lower rate, or making part-prepayments during the loan period to reduce outstanding principal and future interest burden.
          </p>
        </div>
      </div>
    </div>
  )
}
