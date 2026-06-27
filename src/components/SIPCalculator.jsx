import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "What is a SIP and how does it work?",
    answer: "A SIP (Systematic Investment Plan) lets you invest a fixed amount in mutual funds every month. Instead of investing a lump sum, SIP averages your purchase cost over time through rupee cost averaging — you buy more units when prices are low and fewer when prices are high. This reduces the impact of market volatility."
  },
  {
    question: "How much will a ₹5,000 SIP grow in 10 years?",
    answer: "A ₹5,000/month SIP at 12% annual returns over 10 years grows to approximately ₹11.6 lakh. Your total investment is ₹6 lakh, and the returns generated through compounding are approximately ₹5.6 lakh. The longer the duration, the more powerful the compounding effect becomes."
  },
  {
    question: "What is a good return rate to use for SIP calculations?",
    answer: "For long-term equity mutual fund SIPs (10+ years), 12% is a reasonable conservative estimate based on historical data. Large-cap funds have delivered 10–12% annually over long periods. Mid and small-cap funds can deliver 13–16% but with higher risk. Debt funds return 6–8%. Use 12% for planning and treat any higher returns as a bonus."
  },
  {
    question: "What is Step-Up SIP?",
    answer: "A Step-Up SIP (also called Top-Up SIP) automatically increases your monthly investment amount by a fixed percentage each year. For example, starting with ₹5,000/month and increasing by 10% annually means investing ₹5,500 in year 2, ₹6,050 in year 3, and so on. This aligns with typical salary hikes and significantly boosts your final corpus."
  },
  {
    question: "Is SIP better than a lump sum investment?",
    answer: "Both have merits. SIP is better when markets are volatile or you have a regular income — it removes the need to time the market and builds discipline. Lump sum can outperform SIP in consistently rising markets since the entire amount is invested from day one. Most financial advisors recommend SIP for salaried individuals and lump sum for windfall amounts."
  },
  {
    question: "Can I stop or pause my SIP anytime?",
    answer: "Yes. Most mutual fund SIPs allow you to pause, modify, or stop your SIP at any time without penalties. However, stopping SIPs during market downturns is generally counterproductive — downturns are when you buy more units at lower prices, improving your average cost and future returns."
  }
]

const fmt = (v) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR',
  minimumFractionDigits: 0, maximumFractionDigits: 0
}).format(v || 0)

const fmtShort = (v) => {
  if (!v) return '₹0'
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`
  return fmt(v)
}

const PRESETS = [
  { label: '🛡️ Conservative', rate: 8 },
  { label: '⚖️ Moderate', rate: 12 },
  { label: '🚀 Aggressive', rate: 15 }
]

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

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${checked ? 'bg-[#CBFF00]' : 'bg-[#1a1a24] border border-[rgba(255,255,255,0.1)]'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-0.5'}`}></span>
    </button>
  )
}

export default function SIPCalculator() {
  const [calcMode, setCalcMode] = useState("corpus")
  const [monthly, setMonthly] = useState(10000)
  const [returnRate, setReturnRate] = useState(12)
  const [duration, setDuration] = useState(10)
  const [stepUpEnabled, setStepUpEnabled] = useState(false)
  const [stepUpRate, setStepUpRate] = useState(10)
  const [inflationEnabled, setInflationEnabled] = useState(true)
  const [inflationRate, setInflationRate] = useState(6)
  const [targetCorpus, setTargetCorpus] = useState("")
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef(null)

  useEffect(() => {
    const r = returnRate / 100 / 12
    const n = duration * 12

    if (calcMode === 'corpus') {
      if (!monthly || !returnRate || !duration) {
        setResult(null)
        return
      }

      const fv = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
      const invested = monthly * n
      const returns = fv - invested
      const multiplier = (fv / invested).toFixed(1)

      let fvStepUp = 0
      if (stepUpEnabled && stepUpRate > 0) {
        let currentSIP = monthly
        const su = stepUpRate / 100
        for (let year = 0; year < duration; year++) {
          const monthsRemaining = (duration - year) * 12
          const r2 = returnRate / 100 / 12
          fvStepUp += currentSIP * ((Math.pow(1 + r2, monthsRemaining) - 1) / r2) * (1 + r2)
          currentSIP *= (1 + su)
        }
      }

      const realValue = fv / Math.pow(1 + inflationRate / 100, duration)

      const nDelay = (duration - 1) * 12
      const fvDelay = monthly * ((Math.pow(1 + r, nDelay) - 1) / r) * (1 + r)
      const costOfDelay = fv - fvDelay

      const yearlyData = []
      for (let y = 1; y <= duration; y++) {
        const months = y * 12
        const corpusY = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
        const investedY = monthly * months
        let corpusStepY = 0
        if (stepUpEnabled) {
          let sip2 = monthly
          const su = stepUpRate / 100
          for (let yr2 = 0; yr2 < y; yr2++) {
            const mRem = (y - yr2) * 12
            corpusStepY += sip2 * ((Math.pow(1 + r, mRem) - 1) / r) * (1 + r)
            sip2 *= (1 + su)
          }
        }
        yearlyData.push({
          year: y,
          label: `Yr ${y}`,
          invested: investedY,
          returns: corpusY - investedY,
          corpus: corpusY,
          corpusStep: stepUpEnabled ? corpusStepY : null,
          monthlySIP: monthly
        })
      }

      setResult({
        mode: 'corpus',
        fv, invested, returns, multiplier,
        fvStepUp, realValue, costOfDelay,
        returnsPct: ((returns / invested) * 100).toFixed(1),
        yearlyData
      })
    } else {
      const fv = parseFloat(targetCorpus)
      if (!fv || !returnRate || !duration) {
        setResult(null)
        return
      }
      const sipNeeded = fv * r / ((Math.pow(1 + r, n) - 1) * (1 + r))
      const invested = sipNeeded * n
      const returns = fv - invested
      setResult({
        mode: 'goal',
        sipNeeded, fv, invested, returns,
        returnsPct: ((returns / invested) * 100).toFixed(1)
      })
    }

    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [monthly, returnRate, duration, stepUpEnabled, stepUpRate, inflationEnabled, inflationRate, targetCorpus, calcMode])

  const handleCopy = () => {
    if (!result || calcMode !== 'corpus') return
    const stepUpLine = stepUpEnabled ? `Step-Up Corpus (${stepUpRate}%): ${fmtShort(result.fvStepUp)}` : ''
    const text = `SIP Calculation — Toolra\n─────────────────────────\nMonthly SIP: ${fmt(monthly)}\nReturn Rate: ${returnRate}% p.a.\nDuration: ${duration} years\n─────────────────────────\nTotal Invested: ${fmtShort(result.invested)}\nEst. Returns: ${fmtShort(result.returns)}\nFinal Corpus: ${fmtShort(result.fv)}\nYour money grew: ${result.multiplier}x\n${stepUpLine}\n─────────────────────────\nCalculated on toolra.io`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waMessage = (result && calcMode === 'corpus')
    ? `My SIP of ${fmt(monthly)}/month for ${duration} years @ ${returnRate}% grows to ${fmtShort(result.fv)} (Invested: ${fmtShort(result.invested)}, Returns: ${fmtShort(result.returns)}) via Toolra 🔗 toolra.io`
    : ""
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  const renderReturnSection = () => (
    <div className="mb-6">
      <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">Expected Annual Return</label>
      <div className="relative mb-2">
        <input
          type="number"
          min="1"
          max="30"
          step="0.5"
          value={returnRate}
          onChange={(e) => setReturnRate(e.target.value)}
          className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 pr-10 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">%</span>
      </div>
      <SyncedSlider value={Number(returnRate) || 0} onChange={setReturnRate} min={1} max={30} step={0.5} leftLabel="1%" rightLabel="30%" />
      <p className="text-xs text-[#6b6b80] mt-1">Equity MFs historically return 10–15%</p>
    </div>
  )

  const renderDurationSection = () => (
    <div className="mb-6">
      <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">Investment Duration</label>
      <div className="relative mb-2">
        <input
          type="number"
          min="1"
          max="40"
          step="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 pr-12 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">Yr</span>
      </div>
      <SyncedSlider value={Number(duration) || 0} onChange={setDuration} min={1} max={40} step={1} leftLabel="1 Yr" rightLabel="40 Yrs" />
    </div>
  )

  const donutData = result && calcMode === 'corpus' ? [
    { name: 'Invested', value: result.invested },
    { name: 'Returns', value: result.returns }
  ] : []
  const DONUT_COLORS = ['#2a2a35', '#CBFF00']

  let explanation = ""
  if (result && calcMode === 'corpus') {
    explanation = `By investing ${fmt(monthly)} every month for ${duration} years at ${returnRate}% annual returns, your total investment of ${fmtShort(result.invested)} grows to ${fmtShort(result.fv)}. The power of compounding generates ${fmtShort(result.returns)} in returns — that's your money working for you.`
    if (stepUpEnabled) {
      explanation += ` With a ${stepUpRate}% annual step-up, your corpus could grow to ${fmtShort(result.fvStepUp)} — ${fmtShort(result.fvStepUp - result.fv)} more than a regular SIP.`
    }
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 mb-6 block">
        ← All tools
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">SIP Returns Calculator</h1>
          <p className="text-sm text-[#6b6b80]">
            See how your monthly investment grows with the power of compounding.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCalcMode("corpus")}
            className={calcMode === "corpus"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
              : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
          >
            Calculate Corpus
          </button>
          <button
            type="button"
            onClick={() => setCalcMode("goal")}
            className={calcMode === "goal"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
              : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
          >
            How much SIP do I need?
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Quick presets</p>
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setReturnRate(p.rate)}
              className={returnRate === p.rate
                ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 text-sm font-medium"
                : "bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[#f0f0f5] rounded-xl py-2.5 text-sm font-medium"}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: inputs */}
          <div>
            {calcMode === 'corpus' ? (
              <>
                <div className="mb-6">
                  <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">Monthly Investment</label>
                  <div className="relative mb-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">₹</span>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={monthly}
                      onChange={(e) => setMonthly(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-3 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
                    />
                  </div>
                  <SyncedSlider value={Number(monthly) || 0} onChange={setMonthly} min={500} max={100000} step={500} leftLabel="₹500" rightLabel="₹1L+" />
                  <p className="text-xs text-[#6b6b80] mt-1">Minimum recommended: ₹500/month</p>
                </div>

                {renderReturnSection()}
                {renderDurationSection()}

                <div className="mb-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setStepUpEnabled((v) => !v)}
                  >
                    <span className="text-sm text-[#f0f0f5]">📈 Step-Up SIP</span>
                    <ToggleSwitch checked={stepUpEnabled} onChange={setStepUpEnabled} />
                  </div>
                  {stepUpEnabled && (
                    <div className="mt-3">
                      <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">Annual step-up rate</label>
                      <div className="relative mb-2">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          step="1"
                          value={stepUpRate}
                          onChange={(e) => setStepUpRate(e.target.value)}
                          className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 pr-10 text-[#f0f0f5] text-right font-semibold text-lg outline-none focus:border-[#CBFF00] transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80]">%</span>
                      </div>
                      <SyncedSlider value={Number(stepUpRate) || 0} onChange={setStepUpRate} min={1} max={50} step={1} leftLabel="1%" rightLabel="50%" />
                      <p className="text-xs text-[#6b6b80] mt-1">SIP increases by this % each year</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setInflationEnabled((v) => !v)}
                  >
                    <span className="text-sm text-[#f0f0f5]">📊 Inflation Adjustment</span>
                    <ToggleSwitch checked={inflationEnabled} onChange={setInflationEnabled} />
                  </div>
                  {inflationEnabled && (
                    <div className="text-xs text-[#6b6b80] flex items-center gap-2 mt-3">
                      <span>Inflation rate:</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(e.target.value)}
                        className="w-14 bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1 text-[#f0f0f5] text-center outline-none focus:border-[#CBFF00]"
                      />
                      <span>% p.a.</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-xs text-[#6b6b80] uppercase tracking-widest mb-2">Target Corpus (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b80] text-lg">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 50,00,000"
                      value={targetCorpus}
                      onChange={(e) => setTargetCorpus(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-4 text-2xl font-semibold text-[#f0f0f5] outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)] transition-all"
                    />
                  </div>
                </div>
                {renderReturnSection()}
                {renderDurationSection()}
              </>
            )}
          </div>

          {/* Right: results */}
          <div ref={resultRef}>
            {!result && (
              <p className="text-sm text-[#6b6b80] text-center mt-12">
                Enter your investment details to see results
              </p>
            )}

            {calcMode === 'corpus' && result && (
              <>
                <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 mb-4 text-center">
                  <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">Estimated Corpus</p>
                  <p className="text-5xl font-bold text-[#CBFF00] mb-2">{fmtShort(result.fv)}</p>
                  <div className="flex gap-3 justify-center items-center flex-wrap">
                    <span className="bg-[rgba(203,255,0,0.15)] text-[#CBFF00] text-xs px-2 py-1 rounded-full">
                      Your money grew {result.multiplier}x
                    </span>
                    <span className="text-xs text-[#6b6b80]">at {returnRate}% p.a. over {duration} yrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Total Invested</p>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{fmtShort(result.invested)}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Est. Returns</p>
                    <p className="text-sm font-semibold text-[#22c55e]">{fmtShort(result.returns)}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Real Value*</p>
                    <p className="text-sm font-semibold text-[#6b6b80]">{fmtShort(result.realValue)}</p>
                    {inflationEnabled && <p className="text-[10px] text-[#6b6b80] mt-1">*at {inflationRate}% inflation</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="relative inline-block mx-auto">
                      <PieChart width={160} height={160}>
                        <Pie
                          data={donutData}
                          cx={80}
                          cy={80}
                          innerRadius={52}
                          outerRadius={72}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {donutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i]} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#CBFF00]">{result.returnsPct}%</span>
                        <span className="text-[10px] text-[#6b6b80]">returns</span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      <span className="text-xs text-[#6b6b80]">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 bg-[#2a2a35]"></span>
                        Invested {fmtShort(result.invested)}
                      </span>
                      <span className="text-xs text-[#6b6b80]">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 bg-[#CBFF00]"></span>
                        Returns {fmtShort(result.returns)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#6b6b80] mb-2">Wealth Accumulation</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={result.yearlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fill: '#6b6b80', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis
                          tickFormatter={(v) => fmtShort(v)}
                          tick={{ fill: '#6b6b80', fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                        />
                        <Tooltip
                          formatter={(v, n) => [fmtShort(v), n]}
                          contentStyle={{
                            background: '#111118',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#f0f0f5'
                          }}
                        />
                        <Bar dataKey="invested" stackId="a" fill="#2a2a35" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="returns" stackId="a" fill="#CBFF00" radius={[4, 4, 0, 0]} />
                        {stepUpEnabled && result.yearlyData[0]?.corpusStep && (
                          <Bar dataKey="corpusStep" fill="#22c55e" radius={[4, 4, 4, 4]} fillOpacity={0.7} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] text-[#6b6b80]">
                        <span className="inline-block w-2 h-2 rounded-sm mr-1 bg-[#2a2a35]"></span>Invested
                      </span>
                      <span className="text-[10px] text-[#6b6b80]">
                        <span className="inline-block w-2 h-2 rounded-sm mr-1 bg-[#CBFF00]"></span>Returns
                      </span>
                      {stepUpEnabled && (
                        <span className="text-[10px] text-[#6b6b80]">
                          <span className="inline-block w-2 h-2 rounded-sm mr-1 bg-[#22c55e]"></span>Step-Up Corpus
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {stepUpEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#1a1a24] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
                      <p className="text-xs text-[#6b6b80] mb-1">Regular SIP</p>
                      <p className="text-2xl font-bold text-[#f0f0f5]">{fmtShort(result.fv)}</p>
                    </div>
                    <div className="bg-[#1a1a24] rounded-2xl p-5 border-2 border-[#CBFF00]">
                      <p className="text-xs text-[#6b6b80] mb-1">Step-Up SIP ({stepUpRate}%)</p>
                      <p className="text-2xl font-bold text-[#CBFF00]">{fmtShort(result.fvStepUp)}</p>
                      <span className="bg-[rgba(203,255,0,0.15)] text-[#CBFF00] text-xs px-2 py-0.5 rounded-full mt-2 inline-block">
                        ✨ Extra {fmtShort(result.fvStepUp - result.fv)}
                      </span>
                    </div>
                  </div>
                )}

                {inflationEnabled && (
                  <div className="bg-[rgba(203,255,0,0.04)] border border-[rgba(203,255,0,0.15)] rounded-xl p-4 mb-4">
                    <p className="text-sm font-medium text-[#CBFF00] mb-1">
                      💡 Real value in today's money: {fmtShort(result.realValue)}
                    </p>
                    <p className="text-xs text-[#6b6b80] leading-relaxed">
                      {fmtShort(result.fv)} in {duration} years = {fmtShort(result.realValue)} in today's purchasing power at {inflationRate}% inflation
                    </p>
                  </div>
                )}

                <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span>⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-[#ef4444] mb-1">Cost of Delay</p>
                      <p className="text-xs text-[#ef4444] opacity-80">
                        Waiting just 1 year to start this SIP could cost you {fmtShort(result.costOfDelay)} in potential returns due to lost compounding time.
                      </p>
                    </div>
                  </div>
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

            {calcMode === 'goal' && result && (
              <>
                <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 mb-4 text-center">
                  <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">Required Monthly SIP</p>
                  <p className="text-5xl font-bold text-[#CBFF00] mb-2">{fmt(result.sipNeeded)}</p>
                  <p className="text-xs text-[#6b6b80]">to reach {fmtShort(result.fv)} in {duration} yrs at {returnRate}%</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Target Corpus</p>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{fmtShort(result.fv)}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">You invest</p>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{fmtShort(result.invested)}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-1">Est. Returns</p>
                    <p className="text-sm font-semibold text-[#22c55e]">{fmtShort(result.returns)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Year-wise breakdown */}
      {calcMode === 'corpus' && result?.yearlyData && (
        <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] mb-6">
          <div
            className="p-5 flex justify-between cursor-pointer"
            onClick={() => setShowBreakdown((v) => !v)}
          >
            <span className="text-base font-medium text-[#f0f0f5]">📅 Year-wise Breakdown</span>
            <span className="text-[#CBFF00]">{showBreakdown ? "▴" : "▾"}</span>
          </div>

          {showBreakdown && (
            <div className="overflow-x-auto px-5 pb-5">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {stepUpEnabled ? (
                      <>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Year</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Regular SIP</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Regular Corpus</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Step-Up SIP</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Step-Up Corpus</th>
                      </>
                    ) : (
                      <>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Year</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Monthly SIP</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Total Invested</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Returns</th>
                        <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Total Corpus</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((row, i) => {
                    const isLast = i === result.yearlyData.length - 1
                    const rowBg = isLast ? "bg-[rgba(203,255,0,0.06)] font-semibold" : i % 2 === 1 ? "bg-[rgba(203,255,0,0.02)]" : ""
                    const stepUpSipAtYear = monthly * Math.pow(1 + stepUpRate / 100, row.year - 1)
                    return (
                      <tr key={row.year} className={rowBg}>
                        <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{row.year}</td>
                        {stepUpEnabled ? (
                          <>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.monthlySIP)}</td>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.corpus)}</td>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(stepUpSipAtYear)}</td>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.corpusStep)}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.monthlySIP)}</td>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.invested)}</td>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.returns)}</td>
                            <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{fmtShort(row.corpus)}</td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* What does this mean? */}
      {calcMode === 'corpus' && result && (
        <div className="border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.03)] rounded-r-2xl p-6 mb-6">
          <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">What does this mean?</h3>
          <p className="text-sm text-[#6b6b80] leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Smart SIP tips */}
      <div className="bg-[rgba(203,255,0,0.05)] border border-[rgba(203,255,0,0.15)] rounded-2xl p-6 mb-6">
        <h3 className="text-base font-semibold text-[#CBFF00] mb-4">💡 Smart SIP tips</h3>
        <div className="space-y-3">
          {[
            "Start early — ₹1,000/month at age 22 beats ₹5,000/month at age 35 due to longer compounding time",
            "Step-up your SIP by 10% every year in line with salary hikes to dramatically boost your final corpus",
            "Never stop SIPs during market downturns — you buy more units at lower prices, improving your average cost",
            "Index funds historically deliver 11–13% annual returns with very low expense ratios — ideal for most investors"
          ].map((tip, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBFF00] mt-2 flex-shrink-0"></span>
              <span className="text-sm text-[#6b6b80] leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>

      {/* SEO content */}
      <div className="bg-[#111118] rounded-3xl p-8 mb-12 border border-[rgba(255,255,255,0.06)] space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is a SIP?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            A Systematic Investment Plan (SIP) lets you invest a fixed amount in mutual funds every month. Instead of timing the market with a lump sum, SIP averages your purchase cost over time through rupee cost averaging — you buy more units when prices are low and fewer when they are high.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How does SIP compounding work?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Compounding means your returns also earn returns over time. A ₹5,000/month SIP at 12% for 20 years gives you ₹49.9L — even though you only invested ₹12L. The remaining ₹37.9L is pure compounding. The longer your investment horizon, the more dramatic this effect becomes.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What return rate should I use?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Large-cap equity mutual funds have historically delivered 10–12% annually over long periods. Mid and small-cap funds can deliver 13–16% but with higher volatility. Debt funds return 6–8%. Use 12% as a conservative baseline for equity SIP planning over 10+ years.
          </p>
        </div>
      </div>
    </div>
  )
}
