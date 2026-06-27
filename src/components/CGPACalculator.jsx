import React, { useState, useRef } from "react"
import { Link } from "react-router-dom"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "How do I convert CGPA to percentage?",
    answer: "The formula depends on your university. CBSE and most central universities use: Percentage = CGPA × 9.5. VTU and Anna University use: Percentage = CGPA × 10. SPPU (Pune/Mumbai University) uses: Percentage = (CGPA − 0.75) × 10. Select your university preset in our calculator for instant accurate conversion."
  },
  {
    question: "What is the CGPA to percentage formula for VTU?",
    answer: "VTU (Visvesvaraya Technological University) uses the formula: Percentage = CGPA × 10. So a CGPA of 8.2 at VTU equals 82.0%. This differs from CBSE's formula (CGPA × 9.5) which would give 77.9% for the same CGPA."
  },
  {
    question: "What is the CGPA to percentage formula for Mumbai University (SPPU)?",
    answer: "SPPU Pune and Mumbai University use the formula: Percentage = (CGPA − 0.75) × 10. So a CGPA of 8.5 equals (8.5 − 0.75) × 10 = 77.5%. This formula is unique to SPPU/Mumbai University and differs significantly from the standard CBSE formula."
  },
  {
    question: "What CGPA is required for placements at TCS, Infosys and Wipro?",
    answer: "Most major IT companies have minimum percentage requirements: TCS, Wipro, and HCL require 60% or above (CGPA ~6.3 using ×9.5 formula). Infosys and Accenture require 65%+ (CGPA ~6.8). Cognizant requires 65%+. IBM and Deloitte require 70%+ (CGPA ~7.4). Our calculator shows your placement eligibility automatically."
  },
  {
    question: "What is SGPA and how is it different from CGPA?",
    answer: "SGPA (Semester Grade Point Average) measures your performance in a single semester, weighted by subject credits. CGPA (Cumulative Grade Point Average) is the overall average of all your SGPAs across all completed semesters, weighted by credits. Use our SGPA → CGPA tab to calculate your cumulative GPA from individual semester scores."
  },
  {
    question: "What is a good CGPA in engineering?",
    answer: "In Indian engineering colleges, a CGPA above 8.0 (on a 10-point scale) is generally considered excellent and typically qualifies you for First Class with Distinction. 7.0–7.9 is First Class. 6.0–6.9 is also First Class at most universities. Above 9.0 puts you in the top percentile of your batch."
  }
]

const UNIVERSITIES = [
  { id: 'vtu', label: 'VTU ×10', formula: 'multiply', multiplier: 10, subtract: 0 },
  { id: 'anna', label: 'Anna/IIT ×10', formula: 'multiply', multiplier: 10, subtract: 0 },
  { id: 'cbse', label: 'CBSE ×9.5', formula: 'multiply', multiplier: 9.5, subtract: 0 },
  { id: 'sppu', label: 'SPPU (−0.75)×10', formula: 'subtract', multiplier: 10, subtract: 0.75 },
  { id: 'gtu', label: 'GTU (−0.5)×10', formula: 'subtract', multiplier: 10, subtract: 0.5 }
]

const calcPercentage = (cgpa, uni) => {
  if (uni.formula === 'multiply') return (cgpa * uni.multiplier).toFixed(2)
  return ((cgpa - uni.subtract) * uni.multiplier).toFixed(2)
}

const reverseCGPA = (pct, uni) => {
  if (uni.formula === 'multiply') return (pct / uni.multiplier).toFixed(2)
  return ((pct / uni.multiplier) + uni.subtract).toFixed(2)
}

const getGrade = (cgpa) => {
  if (cgpa >= 9.0) return { grade: 'O', division: 'First Class with Distinction' }
  if (cgpa >= 8.0) return { grade: 'A+', division: 'First Class with Distinction' }
  if (cgpa >= 7.0) return { grade: 'A', division: 'First Class' }
  if (cgpa >= 6.0) return { grade: 'B+', division: 'First Class' }
  if (cgpa >= 5.0) return { grade: 'B', division: 'Second Class' }
  if (cgpa >= 4.0) return { grade: 'C', division: 'Pass Class' }
  return { grade: 'F', division: 'Fail' }
}

const getUSGPA = (cgpa) => ((cgpa / 10) * 4).toFixed(2)

const PLACEMENTS = [
  { name: 'TCS/Wipro/HCL', threshold: 60 },
  { name: 'Infosys/Accenture', threshold: 65 },
  { name: 'Cognizant/Capgemini', threshold: 65 },
  { name: 'IBM/Deloitte', threshold: 70 },
  { name: 'Amazon SDE', threshold: 80 }
]

const REF_TABLE_CGPAS = [10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0]

export default function CGPACalculator() {
  const [activeTab, setActiveTab] = useState('converter')
  const [gpaScale, setGpaScale] = useState('indian')
  const [selectedUni, setSelectedUni] = useState('cbse')

  const [direction, setDirection] = useState('cgpa-to-pct')
  const [cgpaInput, setCgpaInput] = useState('')
  const [pctInput, setPctInput] = useState('')
  const [customFormula, setCustomFormula] = useState(false)
  const [customFormulaType, setCustomFormulaType] = useState('simple')
  const [customMultiplier, setCustomMultiplier] = useState(9.5)
  const [customSubtract, setCustomSubtract] = useState(0)
  const [tableFilter, setTableFilter] = useState('All')

  const [currentCGPA, setCurrentCGPA] = useState('')
  const [semsCompleted, setSemsCompleted] = useState('')
  const [totalSems, setTotalSems] = useState('')
  const [targetCGPA, setTargetCGPA] = useState('')

  const [semesters, setSemesters] = useState([
    { id: 1, sgpa: '', credits: '' },
    { id: 2, sgpa: '', credits: '' },
    { id: 3, sgpa: '', credits: '' }
  ])

  const [copied, setCopied] = useState(false)
  const resultRef = useRef(null)

  const baseUni = UNIVERSITIES.find((u) => u.id === selectedUni) || UNIVERSITIES[2]
  const uni = customFormula
    ? {
        id: 'custom',
        label: 'Custom Formula',
        formula: customFormulaType === 'complex' ? 'subtract' : 'multiply',
        multiplier: parseFloat(customMultiplier) || 0,
        subtract: customFormulaType === 'complex' ? (parseFloat(customSubtract) || 0) : 0
      }
    : baseUni

  const doCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const renderUniPills = () => (
    <div className="flex flex-wrap gap-2">
      {UNIVERSITIES.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => { setSelectedUni(u.id); setCustomFormula(false) }}
          className={!customFormula && selectedUni === u.id
            ? "bg-[#CBFF00] text-[#0a0a0f] rounded-full px-3 py-1.5 text-xs font-medium"
            : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#6b6b80] rounded-full px-3 py-1.5 text-xs hover:border-[rgba(203,255,0,0.3)] transition"}
        >
          {u.label}
        </button>
      ))}
    </div>
  )

  // ---- Tab 1: CGPA <-> % ----
  const cgpaVal = parseFloat(cgpaInput)
  let tab1Result = null
  if (direction === 'cgpa-to-pct' && cgpaVal >= 0 && cgpaVal <= 10) {
    const pct = parseFloat(calcPercentage(cgpaVal, uni))
    const { grade, division } = getGrade(cgpaVal)
    const usGPA = getUSGPA(cgpaVal)
    const placements = PLACEMENTS.map((p) => ({ ...p, eligible: pct >= p.threshold }))
    const formulaText = uni.formula === 'multiply'
      ? `CGPA × ${uni.multiplier}`
      : `(CGPA − ${uni.subtract}) × ${uni.multiplier}`
    tab1Result = { pct, grade, division, usGPA, placements, formulaText }
  }

  let reverseResult = null
  if (direction === 'pct-to-cgpa' && parseFloat(pctInput) > 0) {
    const cgpa = parseFloat(reverseCGPA(parseFloat(pctInput), uni))
    const clamped = Math.min(10, Math.max(0, cgpa))
    const { grade, division } = getGrade(clamped)
    reverseResult = { cgpa: clamped.toFixed(2), grade, division, usGPA: getUSGPA(clamped) }
  }

  const tab1CopyText = tab1Result
    ? `CGPA to Percentage — Toolra\n─────────────────────────\nCGPA: ${cgpaInput} / 10\nPercentage: ${tab1Result.pct}%\nFormula: ${tab1Result.formulaText}\nGrade: ${tab1Result.grade} (${tab1Result.division})\nEst. US GPA: ${tab1Result.usGPA} / 4.0\n─────────────────────────\nCalculated on toolra.io`
    : reverseResult
    ? `Percentage to CGPA — Toolra\n─────────────────────────\nPercentage: ${pctInput}%\nCGPA: ${reverseResult.cgpa} / 10\nFormula: ${uni.label}\nGrade: ${reverseResult.grade} (${reverseResult.division})\nEst. US GPA: ${reverseResult.usGPA} / 4.0\n─────────────────────────\nCalculated on toolra.io`
    : ""
  const tab1WaMessage = tab1Result
    ? `My CGPA of ${cgpaInput} converts to ${tab1Result.pct}% (Grade ${tab1Result.grade}) using ${uni.label} — calculated via Toolra 🔗 toolra.io`
    : reverseResult
    ? `A percentage of ${pctInput}% corresponds to a CGPA of ${reverseResult.cgpa} (Grade ${reverseResult.grade}) using ${uni.label} — calculated via Toolra 🔗 toolra.io`
    : ""
  const tab1WaHref = `https://wa.me/?text=${encodeURIComponent(tab1WaMessage)}`

  // ---- Tab 2: Target planner ----
  const cur = parseFloat(currentCGPA)
  const semsComp = parseInt(semsCompleted)
  const semsTotal = parseInt(totalSems)
  const target = parseFloat(targetCGPA)

  let planResult = null
  if (cur && semsComp && semsTotal && target && semsTotal > semsComp) {
    const semsLeft = semsTotal - semsComp
    const reqSGPA = (target * semsTotal - cur * semsComp) / semsLeft
    const maxAchievable = (cur * semsComp + 10 * semsLeft) / semsTotal
    const achievable = reqSGPA <= 10.0
    const progress = Math.min(100, (cur / target) * 100).toFixed(0)
    const journeyPct = ((semsComp / semsTotal) * 100).toFixed(0)

    const projection = []
    for (let s = semsComp + 1; s <= semsTotal; s++) {
      const semsFilledSoFar = s - semsComp
      const projCGPA = achievable
        ? ((cur * semsComp + reqSGPA * semsFilledSoFar) / (semsComp + semsFilledSoFar)).toFixed(2)
        : ((cur * semsComp + 10 * semsFilledSoFar) / (semsComp + semsFilledSoFar)).toFixed(2)
      const gap = (parseFloat(projCGPA) - target).toFixed(2)
      projection.push({
        sem: `Sem ${s}`,
        isGoal: s === semsTotal,
        reqSGPA: achievable ? reqSGPA.toFixed(2) : '10.0',
        projCGPA,
        gap
      })
    }

    const diff = reqSGPA <= 7 ? 'Easy' : reqSGPA <= 8.5 ? 'Medium' : 'Hard'

    planResult = {
      achievable, reqSGPA: reqSGPA.toFixed(2),
      maxAchievable: maxAchievable.toFixed(2),
      semsLeft, progress, journeyPct,
      projection, diff,
      gap: (target - cur).toFixed(1)
    }
  }

  const planCopyText = planResult
    ? `CGPA Target Plan — Toolra\n─────────────────────────\nCurrent CGPA: ${currentCGPA}\nTarget CGPA: ${targetCGPA}\nSems completed: ${semsCompleted}/${totalSems}\nRequired SGPA: ${planResult.reqSGPA} per remaining semester\nRemaining semesters: ${planResult.semsLeft}\nDifficulty: ${planResult.diff}\n─────────────────────────\nCalculated on toolra.io`
    : ""

  // ---- Tab 3: SGPA -> CGPA ----
  const validSems = semesters.filter((s) => s.sgpa && s.credits && parseFloat(s.sgpa) > 0 && parseFloat(s.credits) > 0)

  let sgpaResult = null
  if (validSems.length >= 1) {
    const totalWeighted = validSems.reduce((sum, s) => sum + parseFloat(s.sgpa) * parseFloat(s.credits), 0)
    const totalCredits = validSems.reduce((sum, s) => sum + parseFloat(s.credits), 0)
    const overallCGPA = (totalWeighted / totalCredits).toFixed(2)
    const pct = calcPercentage(parseFloat(overallCGPA), uni)

    const sgpaVals = validSems.map((s) => parseFloat(s.sgpa))
    const maxSGPA = Math.max(...sgpaVals)
    const minSGPA = Math.min(...sgpaVals)
    const bestIdx = sgpaVals.indexOf(maxSGPA)
    const worstIdx = sgpaVals.indexOf(minSGPA)

    let trend = '→ Stable'
    if (validSems.length >= 2) {
      const last = parseFloat(validSems[validSems.length - 1].sgpa)
      const prev = parseFloat(validSems[validSems.length - 2].sgpa)
      if (last > prev + 0.2) trend = '↑ Improving'
      else if (last < prev - 0.2) trend = '↓ Declining'
    }

    const formulaParts = validSems.map((s) => `${s.sgpa}×${s.credits}`).join(' + ')
    const formulaLine = `(${formulaParts}) / ${totalCredits}`

    sgpaResult = {
      overallCGPA, pct,
      best: { sem: `Sem ${bestIdx + 1}`, val: maxSGPA.toFixed(1) },
      worst: { sem: `Sem ${worstIdx + 1}`, val: minSGPA.toFixed(1) },
      trend, formulaLine,
      totalWeighted: totalWeighted.toFixed(1),
      totalCredits
    }
  }

  const sgpaCopyText = sgpaResult
    ? `SGPA → CGPA — Toolra\n──────────────────────\n${semesters.map((s, i) => `Sem ${i + 1}: ${s.sgpa} SGPA / ${s.credits} credits`).join('\n')}\n──────────────────────\nOverall CGPA: ${sgpaResult.overallCGPA}\nPercentage: ${sgpaResult.pct}% (${uni.label})\nBest: ${sgpaResult.best.sem} (${sgpaResult.best.val})\nWorst: ${sgpaResult.worst.sem} (${sgpaResult.worst.val})\nTrend: ${sgpaResult.trend}\n──────────────────────\nCalculated on toolra.io`
    : ""
  const sgpaWaMessage = sgpaResult
    ? `My cumulative CGPA across ${validSems.length} semesters is ${sgpaResult.overallCGPA} (${sgpaResult.pct}%) — calculated via Toolra 🔗 toolra.io`
    : ""
  const sgpaWaHref = `https://wa.me/?text=${encodeURIComponent(sgpaWaMessage)}`

  const updateSemester = (id, field, value) => {
    setSemesters((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }
  const addSemester = () => {
    setSemesters((prev) => [...prev, { id: Math.max(0, ...prev.map((s) => s.id)) + 1, sgpa: '', credits: '' }])
  }
  const removeSemester = (id) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id))
  }

  // ---- Explanation ----
  let explanation = ""
  if (activeTab === 'converter') {
    explanation = tab1Result
      ? `Your CGPA of ${cgpaInput} converts to ${tab1Result.pct}% using the ${uni.label} formula. This places you in the ${tab1Result.grade} grade bracket — ${tab1Result.division}.`
      : reverseResult
      ? `A percentage of ${pctInput}% corresponds to a CGPA of ${reverseResult.cgpa} using the ${uni.label} formula.`
      : "Enter your CGPA or percentage to see a detailed conversion breakdown."
  } else if (activeTab === 'planner') {
    explanation = planResult
      ? `To reach a CGPA of ${targetCGPA} from your current ${currentCGPA} in ${planResult.semsLeft} remaining semesters, you need to score ${planResult.reqSGPA} SGPA every semester — ${planResult.achievable ? 'which is achievable with consistent effort.' : 'which exceeds the maximum. Consider revising your target.'}`
      : "Fill in your current CGPA, target CGPA, and semester counts to see your academic plan."
  } else {
    explanation = sgpaResult
      ? `Your weighted CGPA across ${validSems.length} semesters is ${sgpaResult.overallCGPA}. This converts to ${sgpaResult.pct}% using ${uni.label}. Your performance is ${sgpaResult.trend.toLowerCase()}.`
      : "Enter at least one semester's SGPA and credits to calculate your cumulative CGPA."
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 mb-6 block">
        ← All tools
      </Link>

      <PageHeader gpaScale={gpaScale} setGpaScale={setGpaScale} />

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'converter' && (
        <>
          <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column */}
              <div>
                <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Conversion direction</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setDirection('cgpa-to-pct')}
                    className={direction === 'cgpa-to-pct'
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 text-sm font-medium"
                      : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-2.5 text-sm"}
                  >
                    CGPA → %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('pct-to-cgpa')}
                    className={direction === 'pct-to-cgpa'
                      ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl py-2.5 text-sm font-medium"
                      : "bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] text-[#f0f0f5] rounded-xl py-2.5 text-sm"}
                  >
                    % → CGPA
                  </button>
                </div>

                {direction === 'cgpa-to-pct' ? (
                  <div>
                    <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Enter CGPA (0.0 – 10.0)</p>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={cgpaInput}
                        onChange={(e) => setCgpaInput(e.target.value)}
                        className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-4 text-3xl font-bold text-[#f0f0f5] outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80] text-sm">/ 10</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-[#6b6b80] mb-2">Common values</p>
                      <div className="flex gap-2 flex-wrap">
                        {["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0", "9.5"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setCgpaInput(v)}
                            className="bg-[#1a1a24] text-xs text-[#6b6b80] rounded-full px-2.5 py-1 hover:bg-[rgba(203,255,0,0.1)] hover:text-[#CBFF00] transition"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Enter percentage (0 – 100)</p>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={pctInput}
                        onChange={(e) => setPctInput(e.target.value)}
                        className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-4 text-3xl font-bold text-[#f0f0f5] outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b80] text-sm">%</span>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2">University formula</p>
                  {renderUniPills()}
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setCustomFormula((v) => !v)}
                    className="text-xs text-[#CBFF00] cursor-pointer"
                  >
                    ⊕ Use custom formula
                  </button>
                  {customFormula && (
                    <div className="bg-[#1a1a24] rounded-xl p-4 mt-2 space-y-2">
                      <label className="flex items-center gap-2 flex-wrap">
                        <input
                          type="radio"
                          checked={customFormulaType === 'simple'}
                          onChange={() => setCustomFormulaType('simple')}
                          className="accent-[#CBFF00]"
                        />
                        <span className="text-sm text-[#f0f0f5]">Simple: CGPA ×</span>
                        <input
                          type="number"
                          step="0.1"
                          value={customMultiplier}
                          onChange={(e) => setCustomMultiplier(e.target.value)}
                          className="w-16 bg-[#0a0a0f] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1 text-sm text-[#f0f0f5] outline-none focus:border-[#CBFF00]"
                        />
                      </label>
                      <label className="flex items-center gap-2 flex-wrap">
                        <input
                          type="radio"
                          checked={customFormulaType === 'complex'}
                          onChange={() => setCustomFormulaType('complex')}
                          className="accent-[#CBFF00]"
                        />
                        <span className="text-sm text-[#f0f0f5]">Complex: (CGPA −</span>
                        <input
                          type="number"
                          step="0.1"
                          value={customSubtract}
                          onChange={(e) => setCustomSubtract(e.target.value)}
                          className="w-14 bg-[#0a0a0f] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1 text-sm text-[#f0f0f5] outline-none focus:border-[#CBFF00]"
                        />
                        <span className="text-sm text-[#f0f0f5]">) ×</span>
                        <input
                          type="number"
                          step="0.1"
                          value={customMultiplier}
                          onChange={(e) => setCustomMultiplier(e.target.value)}
                          className="w-14 bg-[#0a0a0f] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1 text-sm text-[#f0f0f5] outline-none focus:border-[#CBFF00]"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div ref={resultRef}>
                {direction === 'cgpa-to-pct' && tab1Result && (
                  <>
                    <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">Your Percentage</p>
                          <p className="text-6xl font-bold text-[#CBFF00]">{tab1Result.pct}%</p>
                          <p className="text-xs text-[#6b6b80] mt-2">Formula: {tab1Result.formulaText}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => doCopy(tab1CopyText)} className="bg-[#1a1a24] rounded-lg p-2 text-[#6b6b80] hover:text-[#CBFF00]">
                            {copied ? '✓' : '📋'}
                          </button>
                          <a href={tab1WaHref} target="_blank" rel="noopener noreferrer" className="bg-[#1a1a24] rounded-lg p-2 text-[#6b6b80] hover:text-[#CBFF00] inline-block">
                            📤
                          </a>
                        </div>
                      </div>
                    </div>

                    <GradeRow grade={tab1Result.grade} division={tab1Result.division} usGPA={tab1Result.usGPA} gpaScale={gpaScale} />

                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wide text-[#6b6b80] mb-2">Placement Eligibility Check</p>
                      <div className="flex flex-wrap gap-2">
                        {tab1Result.placements.map((p) => (
                          <span
                            key={p.name}
                            className={(p.eligible
                              ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
                              : "bg-[rgba(239,68,68,0.1)] text-[#ef4444] opacity-60 border border-[rgba(239,68,68,0.2)]") + " rounded-full px-3 py-1 text-xs flex items-center gap-1"}
                          >
                            {p.eligible ? '✅' : '❌'} {p.name} ({p.threshold}%+)
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {direction === 'pct-to-cgpa' && reverseResult && (
                  <>
                    <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] tracking-[0.15em] text-[#CBFF00] opacity-70 uppercase mb-2">Your CGPA</p>
                          <p className="text-6xl font-bold text-[#CBFF00]">{reverseResult.cgpa}</p>
                          <p className="text-xs text-[#6b6b80] mt-2">Formula: {uni.label}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => doCopy(tab1CopyText)} className="bg-[#1a1a24] rounded-lg p-2 text-[#6b6b80] hover:text-[#CBFF00]">
                            {copied ? '✓' : '📋'}
                          </button>
                          <a href={tab1WaHref} target="_blank" rel="noopener noreferrer" className="bg-[#1a1a24] rounded-lg p-2 text-[#6b6b80] hover:text-[#CBFF00] inline-block">
                            📤
                          </a>
                        </div>
                      </div>
                    </div>
                    <GradeRow grade={reverseResult.grade} division={reverseResult.division} usGPA={reverseResult.usGPA} gpaScale={gpaScale} />
                  </>
                )}

                {!tab1Result && !reverseResult && (
                  <p className="text-sm text-[#6b6b80] text-center mt-12">
                    Enter a value to see the conversion
                  </p>
                )}
              </div>
            </div>
          </div>

          <ReferenceTable cgpaInput={cgpaInput} tableFilter={tableFilter} setTableFilter={setTableFilter} />
        </>
      )}

      {activeTab === 'planner' && (
        <PlannerTab
          currentCGPA={currentCGPA} setCurrentCGPA={setCurrentCGPA}
          targetCGPA={targetCGPA} setTargetCGPA={setTargetCGPA}
          semsCompleted={semsCompleted} setSemsCompleted={setSemsCompleted}
          totalSems={totalSems} setTotalSems={setTotalSems}
          planResult={planResult} copied={copied}
          onCopyPlan={() => doCopy(planCopyText)}
        />
      )}

      {activeTab === 'sgpa' && (
        <SgpaTab
          renderUniPills={renderUniPills}
          uni={uni}
          semesters={semesters}
          updateSemester={updateSemester}
          addSemester={addSemester}
          removeSemester={removeSemester}
          sgpaResult={sgpaResult}
          copied={copied}
          onCopy={() => doCopy(sgpaCopyText)}
          waHref={sgpaWaHref}
        />
      )}

      <div className="border-l-4 border-[#CBFF00] bg-[rgba(203,255,0,0.03)] rounded-r-2xl p-6 mb-6">
        <h3 className="font-semibold text-[#f0f0f5] mb-2">What does this mean?</h3>
        <p className="text-sm text-[#6b6b80] leading-relaxed">{explanation}</p>
      </div>

      <div className="mt-8">
        <FAQSection faqs={faqs} />
      </div>

      <SeoBlock />
    </div>
  )
}

function GradeRow({ grade, division, usGPA, gpaScale }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-[#1a1a24] rounded-xl p-4">
        <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Letter Grade</p>
        <p className="text-2xl font-bold text-[#f0f0f5]">{grade}</p>
      </div>
      <div className="bg-[#1a1a24] rounded-xl p-4">
        <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Division</p>
        <p className="text-sm font-semibold text-[#f0f0f5]">{division}</p>
      </div>
      <div className="bg-[#1a1a24] rounded-xl p-4 relative">
        <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Est. US GPA</p>
        <p className="text-2xl font-bold text-[#CBFF00]">{usGPA} <span className="text-xs text-[#6b6b80]">/ 4.0</span></p>
        {gpaScale === 'us' && (
          <span title="Approximation: (CGPA / 10) × 4" className="absolute top-3 right-3 text-[#6b6b80] text-xs cursor-help">ⓘ</span>
        )}
      </div>
    </div>
  )
}

function PageHeader({ gpaScale, setGpaScale }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
      <div>
        <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">CGPA to Percentage Calculator</h1>
        <p className="text-sm text-[#6b6b80]">
          Convert CGPA to percentage, plan your target CGPA, and calculate cumulative GPA from semester scores.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setGpaScale("indian")}
          className={gpaScale === "indian"
            ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
            : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
        >
          🇮🇳 Indian 10-point
        </button>
        <button
          type="button"
          onClick={() => setGpaScale("us")}
          className={gpaScale === "us"
            ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
            : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
        >
          🌍 US 4.0 GPA
        </button>
      </div>
    </div>
  )
}

function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'converter', label: 'CGPA → %' },
    { id: 'planner', label: 'Target Planner' },
    { id: 'sgpa', label: 'SGPA → CGPA' }
  ]
  return (
    <div className="flex border-b border-[rgba(255,255,255,0.06)] mb-6 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setActiveTab(t.id)}
          className={activeTab === t.id
            ? "text-[#CBFF00] border-b-2 border-[#CBFF00] pb-3 font-medium mr-8 text-sm cursor-pointer whitespace-nowrap"
            : "text-[#6b6b80] hover:text-[#f0f0f5] pb-3 mr-8 text-sm cursor-pointer whitespace-nowrap"}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function ReferenceTable({ cgpaInput, tableFilter, setTableFilter }) {
  const filters = ["All", "CBSE ×9.5", "×10", "SPPU"]
  const showCBSE = tableFilter === 'All' || tableFilter === 'CBSE ×9.5'
  const showTen = tableFilter === 'All' || tableFilter === '×10'
  const showSPPU = tableFilter === 'All' || tableFilter === 'SPPU'
  const inputVal = parseFloat(cgpaInput)

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-[#f0f0f5]">Quick Conversion Table</h2>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTableFilter(f)}
              className={tableFilter === f
                ? "bg-[#CBFF00] text-[#0a0a0f] rounded-full px-3 py-1 text-xs"
                : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-full px-3 py-1 text-xs"}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">CGPA</th>
              {showCBSE && <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">×9.5 (CBSE)</th>}
              {showTen && <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">×10 (Anna/VTU)</th>}
              {showSPPU && <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">(−0.75)×10 (SPPU)</th>}
              <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Grade</th>
              <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-3 text-left">Division</th>
            </tr>
          </thead>
          <tbody>
            {REF_TABLE_CGPAS.map((c, i) => {
              const isYou = !isNaN(inputVal) && Math.abs(inputVal - c) < 0.001
              const { grade, division } = getGrade(c)
              const rowClass = isYou ? "bg-[rgba(203,255,0,0.08)] font-semibold" : i % 2 === 1 ? "bg-[rgba(255,255,255,0.01)]" : ""
              return (
                <tr key={c} className={rowClass}>
                  <td className={"px-4 py-3 border-b border-[rgba(255,255,255,0.04)] " + (isYou ? "text-[#CBFF00]" : "text-[#f0f0f5]")}>
                    {isYou ? `${cgpaInput} (You)` : c.toFixed(1)}
                  </td>
                  {showCBSE && <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{calcPercentage(c, { formula: 'multiply', multiplier: 9.5 })}%</td>}
                  {showTen && <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{calcPercentage(c, { formula: 'multiply', multiplier: 10 })}%</td>}
                  {showSPPU && <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{calcPercentage(c, { formula: 'subtract', multiplier: 10, subtract: 0.75 })}%</td>}
                  <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{grade}</td>
                  <td className="px-4 py-3 text-[#f0f0f5] border-b border-[rgba(255,255,255,0.04)]">{division}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlannerTab({ currentCGPA, setCurrentCGPA, targetCGPA, setTargetCGPA, semsCompleted, setSemsCompleted, totalSems, setTotalSems, planResult, copied, onCopyPlan }) {
  const inputClass = "w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-lg font-semibold outline-none focus:border-[#CBFF00] placeholder-[#6b6b80]"
  const diffColor = planResult ? (planResult.diff === 'Easy' ? '#22c55e' : planResult.diff === 'Medium' ? '#CBFF00' : '#ef4444') : '#f0f0f5'
  const diffPct = planResult ? (planResult.diff === 'Easy' ? 33 : planResult.diff === 'Medium' ? 66 : 100) : 0

  return (
    <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Current CGPA</label>
          <input type="number" min="0" max="10" step="0.1" placeholder="e.g. 6.0" value={currentCGPA} onChange={(e) => setCurrentCGPA(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Target CGPA</label>
          <input type="number" min="0" max="10" step="0.1" placeholder="e.g. 9.0" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Sems Completed</label>
          <input type="number" min="0" placeholder="e.g. 3" value={semsCompleted} onChange={(e) => setSemsCompleted(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Total Semesters</label>
          <input type="number" min="1" placeholder="e.g. 8" value={totalSems} onChange={(e) => setTotalSems(e.target.value)} className={inputClass} />
        </div>
      </div>

      {planResult && (
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] text-[#6b6b80] uppercase">Current</p>
              <p className="text-2xl font-bold text-[#f0f0f5]">{currentCGPA}</p>
            </div>
            <span className="bg-[rgba(203,255,0,0.15)] text-[#CBFF00] text-xs px-2 py-1 rounded-full">+{planResult.gap} NEEDED</span>
            <div className="text-right">
              <p className="text-[10px] text-[#6b6b80] uppercase">Target</p>
              <p className="text-2xl font-bold text-[#CBFF00]">{targetCGPA}</p>
            </div>
          </div>
          <div className="relative h-3 bg-[#1a1a24] rounded-full">
            <div className="absolute left-0 h-full bg-[#CBFF00] rounded-full" style={{ width: `${planResult.progress}%` }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white" style={{ left: `calc(${planResult.progress}% - 5px)` }}></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-[#6b6b80]">
            <span>{semsCompleted} of {totalSems} sems completed</span>
            <span className="text-[#CBFF00]">{planResult.journeyPct}% journey remaining</span>
          </div>
        </div>
      )}

      {planResult && planResult.achievable && (
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex gap-3 items-center">
              <span className="text-[#22c55e]">✅</span>
              <div>
                <p className="text-lg font-semibold text-[#22c55e]">Target is achievable!</p>
                <p className="text-xs text-[#6b6b80]">Here is your required academic plan.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onCopyPlan} className="border border-[rgba(203,255,0,0.35)] text-[#CBFF00] text-xs px-3 py-1.5 rounded-lg">
                {copied ? "✓ Copied" : "Copy Plan"}
              </button>
              <button type="button" onClick={() => window.print()} className="bg-[#CBFF00] text-[#0a0a0f] text-xs px-3 py-1.5 rounded-lg font-medium">
                PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4">
              <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Min. SGPA Required</p>
              <p className="text-4xl font-bold text-[#CBFF00]">{planResult.reqSGPA}</p>
            </div>
            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4">
              <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Remaining Sems</p>
              <p className="text-4xl font-bold text-[#f0f0f5]">{planResult.semsLeft}</p>
            </div>
            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4">
              <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Max Possible</p>
              <p className="text-4xl font-bold text-[#f0f0f5]">{planResult.maxAchievable}</p>
            </div>
            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4">
              <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Difficulty</p>
              <p className="text-lg font-semibold" style={{ color: diffColor }}>{planResult.diff}</p>
              <div className="h-1.5 bg-[#1a1a24] rounded-full mt-2">
                <div className="h-full rounded-full" style={{ width: `${diffPct}%`, background: diffColor }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(203,255,0,0.05)] rounded-xl p-4 border-l-2 border-[#CBFF00] mb-4">
            <p className="text-xs font-semibold text-[#CBFF00] mb-1">💡 What does this mean?</p>
            <p className="text-xs text-[#6b6b80]">
              To reach your target of {targetCGPA} by Semester {totalSems}, you need to score an average of {planResult.reqSGPA} SGPA in each of your remaining {planResult.semsLeft} semesters.
            </p>
          </div>

          <p className="text-sm font-medium text-[#f0f0f5] mb-3">Semester-wise projection</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-2.5 text-left">Semester</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-2.5 text-left">Required SGPA</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-2.5 text-left">Projected CGPA</th>
                  <th className="bg-[#CBFF00] text-[#0a0a0f] font-semibold px-4 py-2.5 text-left">Gap to Target</th>
                </tr>
              </thead>
              <tbody>
                {planResult.projection.map((row, i) => (
                  <tr key={row.sem} className={row.isGoal ? "bg-[rgba(203,255,0,0.08)]" : i % 2 === 1 ? "bg-[rgba(255,255,255,0.01)]" : ""}>
                    <td className="px-4 py-2.5 text-[#f0f0f5]">{row.isGoal ? "● " : ""}{row.sem}{row.isGoal ? " (Goal)" : ""}</td>
                    <td className="px-4 py-2.5 text-[#f0f0f5]">{row.reqSGPA}</td>
                    <td className={"px-4 py-2.5 " + (row.isGoal ? "text-[#CBFF00]" : "text-[#f0f0f5]")}>{row.projCGPA}</td>
                    <td className={"px-4 py-2.5 " + (parseFloat(row.gap) >= 0 ? "text-[#22c55e]" : "text-[#ef4444]")}>
                      {parseFloat(row.gap) >= 0 ? "+" : ""}{row.gap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {planResult && !planResult.achievable && (
        <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-2xl p-6 mb-6">
          <p className="text-lg font-semibold text-[#ef4444] mb-3">❌ Target not achievable</p>
          <p className="text-sm text-[#6b6b80] mb-2">Required SGPA would be {planResult.reqSGPA} — exceeds maximum of 10.0</p>
          <p className="text-sm text-[#6b6b80] mb-3">Maximum CGPA you can achieve: {planResult.maxAchievable}</p>
          <p className="text-sm font-medium text-[#CBFF00] bg-[rgba(203,255,0,0.06)] rounded-lg px-4 py-2 inline-block mt-1">
            💡 Suggested revised target: {parseFloat(planResult.maxAchievable).toFixed(1)}
          </p>
        </div>
      )}
    </div>
  )
}

function SgpaTab({ renderUniPills, uni, semesters, updateSemester, addSemester, removeSemester, sgpaResult, copied, onCopy, waHref }) {
  return (
    <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div>
          <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2">University formula</p>
          <div className="mb-6">{renderUniPills()}</div>

          <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-3">Semester scores</p>
          {semesters.map((sem, i) => (
            <div key={sem.id} className="flex items-center gap-3 bg-[#1a1a24] rounded-xl p-3 mb-2">
              <span className="text-xs text-[#6b6b80] w-14 flex-shrink-0">Sem {i + 1}</span>
              <input
                placeholder="SGPA (0-10)"
                value={sem.sgpa}
                onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                className="flex-1 bg-transparent border-b border-[rgba(255,255,255,0.1)] text-[#f0f0f5] text-sm outline-none focus:border-[#CBFF00] pb-1"
              />
              <span className="text-[#6b6b80] text-xs">/</span>
              <input
                placeholder="Credits"
                value={sem.credits}
                onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                className="w-20 bg-transparent border-b border-[rgba(255,255,255,0.1)] text-[#f0f0f5] text-sm outline-none focus:border-[#CBFF00] pb-1 text-center"
              />
              <span className="text-xs text-[#6b6b80]">cr</span>
              <button type="button" onClick={() => removeSemester(sem.id)} className="text-[#6b6b80] hover:text-[#ef4444] transition ml-1 text-base">
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSemester}
            className="w-full border border-dashed border-[rgba(203,255,0,0.3)] text-[#CBFF00] text-sm rounded-xl py-3 hover:bg-[rgba(203,255,0,0.04)] transition mt-2"
          >
            + Add Semester
          </button>
        </div>

        {/* Right column */}
        <div>
          {sgpaResult ? (
            <>
              <p className="text-[10px] uppercase text-[#6b6b80] tracking-widest mb-2">Overall Result</p>
              <p className="text-7xl font-bold text-[#CBFF00] inline">{sgpaResult.overallCGPA}</p>
              <span className="text-sm text-[#6b6b80] ml-2">CGPA</span>
              <p className="text-sm text-[#f0f0f5] mt-2">Percentage: {sgpaResult.pct}% (using {uni.label})</p>

              <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
                <div className="bg-[#1a1a24] rounded-xl p-4">
                  <p className="text-xs text-[#6b6b80] mb-1">Best Semester</p>
                  <p className="text-sm font-semibold text-[#22c55e]">{sgpaResult.best.sem}: {sgpaResult.best.val}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-4">
                  <p className="text-xs text-[#6b6b80] mb-1">Worst Semester</p>
                  <p className="text-sm font-semibold text-[#ef4444]">{sgpaResult.worst.sem}: {sgpaResult.worst.val}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-4">
                  <p className="text-xs text-[#6b6b80] mb-1">Trend</p>
                  <p className={"text-sm font-semibold " + (sgpaResult.trend.startsWith('↑') ? "text-[#22c55e]" : sgpaResult.trend.startsWith('↓') ? "text-[#ef4444]" : "text-[#6b6b80]")}>
                    {sgpaResult.trend}
                  </p>
                  <p className="text-[10px] text-[#6b6b80] mt-0.5">based on last 2 sems</p>
                </div>
              </div>

              <div className="bg-[#0a0a0f] rounded-xl p-4 mt-4 border border-[rgba(255,255,255,0.04)]">
                <p className="text-xs text-[#6b6b80] mb-2">Σ Formula Applied</p>
                <p className="font-mono text-sm text-[#CBFF00]">CGPA = Σ(SGPA × Credits) / Σ(Credits)</p>
                <p className="font-mono text-xs text-[#6b6b80]">= ({sgpaResult.formulaLine})</p>
                <p className="font-mono text-xs text-[#6b6b80]">= {sgpaResult.totalWeighted} / {sgpaResult.totalCredits}</p>
                <p className="font-mono text-sm text-[#f0f0f5] font-semibold">= {sgpaResult.overallCGPA}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="button" onClick={onCopy} className="border border-[rgba(203,255,0,0.35)] text-[#CBFF00] bg-transparent rounded-xl py-2.5 text-sm font-medium hover:bg-[rgba(203,255,0,0.06)] transition">
                  {copied ? "✓ Copied!" : "📋 Copy result"}
                </button>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition flex items-center justify-center">
                  💬 Share on WhatsApp
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6b6b80] text-center mt-12">
              Enter at least one semester's SGPA and credits to calculate
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function SeoBlock() {
  return (
    <div className="bg-[#111118] rounded-3xl p-8 mb-12 border border-[rgba(255,255,255,0.06)] space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is CGPA?</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          CGPA (Cumulative Grade Point Average) is the overall average of grade points obtained across all semesters. It ranges from 0 to 10 in India and is used by most universities as the primary academic performance indicator.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How is CGPA converted to percentage?</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          The formula varies by university: CBSE and DU use CGPA × 9.5; VTU and Anna University use CGPA × 10; SPPU/Mumbai University uses (CGPA − 0.75) × 10; GTU/AKTU uses (CGPA − 0.5) × 10. Always check your official transcripts for the exact formula.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">Which formula does my university use?</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Check your official marksheet or university regulations. We have included accurate presets for VTU, Anna University, CBSE/DU, SPPU, and GTU. When in doubt, contact your academic section or use the Custom Formula option above.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is SGPA vs CGPA?</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          SGPA (Semester Grade Point Average) measures performance in a single semester, weighted by subject credits. CGPA is the cumulative average of all SGPAs weighted by credits. Use our SGPA → CGPA tab to calculate your cumulative GPA from individual semester scores.
        </p>
      </div>
    </div>
  )
}
