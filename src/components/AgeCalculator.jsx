import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import FAQSection from "./FAQSection"

const faqs = [
  {
    question: "How is exact age calculated?",
    answer: "Exact age is calculated by finding the difference between your date of birth and today's date (or a reference date), accounting for varying month lengths and leap years. The result gives your age in years, months, and days. Our calculator also shows total days, weeks, hours, and a live seconds counter."
  },
  {
    question: "How do I check my age for UPSC eligibility?",
    answer: "UPSC calculates your age as of August 1 of the exam year. Use the 'Calculate age as of' field in our calculator and select the UPSC cutoff date preset. The minimum age for UPSC Civil Services is 21 years and the maximum is 32 for General category, 35 for OBC, and 37 for SC/ST candidates."
  },
  {
    question: "What is the age limit for SSC CGL?",
    answer: "The age limit for SSC CGL is typically 18–27 years for most posts, with relaxations for reserved categories. Age is calculated as of January 1 of the year of examination. Use our calculator's SSC preset to check your exact age as of the cutoff date."
  },
  {
    question: "How are leap years calculated?",
    answer: "A year is a leap year if it is divisible by 4, except for century years which must be divisible by 400. So 2000 and 2024 are leap years, but 1900 is not. Leap years add an extra day (February 29) to the calendar, which affects precise age calculations."
  },
  {
    question: "What day of the week was I born on?",
    answer: "Our Age Calculator automatically tells you the day of the week you were born on when you enter your date of birth. Simply enter your DOB and the calculator will show your birth day along with your zodiac sign and other fun lifetime statistics."
  },
  {
    question: "How many days old am I?",
    answer: "To find how many days old you are, enter your date of birth in our Age Calculator. It will instantly show you your exact age in days, weeks, hours, minutes, and a live-updating seconds counter. For example, a 25-year-old is approximately 9,125 days old."
  }
]

const fmtNum = (n) => new Intl.NumberFormat('en-IN').format(n)

const today = new Date().toISOString().split('T')[0]

const AGE_PRESETS = [
  { label: "👶 Gen Z", date: "2003-01-01" },
  { label: "💼 Millennial", date: "1990-01-01" },
  { label: "🎸 Gen X", date: "1980-01-01" },
  { label: "🏖️ Retirement", date: "1965-01-01" }
]

const EXAM_PRESETS = [
  { label: "📅 Today", date: today },
  { label: "🏛️ UPSC Aug '25", date: "2025-08-01" },
  { label: "📝 SSC Jan '26", date: "2026-01-01" },
  { label: "🏦 IBPS Oct '25", date: "2025-10-01" }
]

const calcAge = (birthDate, refDate) => {
  const birth = new Date(birthDate)
  const ref = new Date(refDate)

  let years = ref.getFullYear() - birth.getFullYear()
  let months = ref.getMonth() - birth.getMonth()
  let days = ref.getDate() - birth.getDate()

  if (days < 0) {
    months--
    days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate()
  }
  if (months < 0) { years--; months += 12 }

  const totalDays = Math.floor((ref - birth) / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)
  const totalHours = totalDays * 24
  const totalMinutes = totalHours * 60
  const totalSeconds = totalMinutes * 60

  const nextBday = new Date(ref.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBday <= ref) {
    nextBday.setFullYear(ref.getFullYear() + 1)
  }
  const daysUntilBday = Math.ceil((nextBday - ref) / (1000 * 60 * 60 * 24))

  const lastBday = new Date(nextBday)
  lastBday.setFullYear(nextBday.getFullYear() - 1)
  const yearProgress = Math.round(((ref - lastBday) / (nextBday - lastBday)) * 100)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayBorn = dayNames[birth.getDay()]

  const getZodiac = (month, day) => {
    const signs = [
      [1, 20, 'Aquarius'], [2, 19, 'Pisces'],
      [3, 21, 'Aries'], [4, 20, 'Taurus'],
      [5, 21, 'Gemini'], [6, 21, 'Cancer'],
      [7, 23, 'Leo'], [8, 23, 'Virgo'],
      [9, 23, 'Libra'], [10, 23, 'Scorpio'],
      [11, 22, 'Sagittarius'], [12, 22, 'Capricorn']
    ]
    for (const [m, d, sign] of signs) {
      if (month === m && day >= d) return sign
      if (month === m + 1 && day < d) return sign
    }
    return 'Capricorn'
  }
  const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate())

  let leapYears = 0
  for (let y = birth.getFullYear(); y <= ref.getFullYear(); y++) {
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) leapYears++
  }

  const heartbeats = Math.round(totalMinutes * 72)
  const breaths = Math.round(totalMinutes * 16)
  const yearsSlept = (totalDays * 8 / 24 / 365.25).toFixed(1)

  const nextBdayFormatted = nextBday.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return {
    years, months, days,
    totalDays, totalWeeks, totalHours,
    totalMinutes, totalSeconds,
    daysUntilBday, yearProgress,
    nextBdayFormatted, nextBday,
    dayBorn, zodiac, leapYears,
    heartbeats, breaths, yearsSlept,
    birthdays: years
  }
}

export default function AgeCalculator() {
  const [mode, setMode] = useState("myage")
  const [dob, setDob] = useState("")
  const [asOfDate, setAsOfDate] = useState(today)
  const [dobB, setDobB] = useState("")
  const [result, setResult] = useState(null)
  const [liveSeconds, setLiveSeconds] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showLifeFile, setShowLifeFile] = useState(true)
  const resultRef = useRef(null)

  useEffect(() => {
    if (!dob) { setResult(null); return }
    const r = calcAge(dob, asOfDate)
    setResult(r)
    setLiveSeconds(r.totalSeconds)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
  }, [dob, asOfDate])

  useEffect(() => {
    if (!result) return
    const interval = setInterval(() => {
      setLiveSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [result])

  const handleCopy = () => {
    if (!result) return
    const text = `My Age — Toolra\n──────────────────\nAge: ${result.years} years, ${result.months} months, ${result.days} days\nAs of: ${asOfDate}\nDays lived: ${fmtNum(result.totalDays)}\nSeconds lived: ${fmtNum(liveSeconds)}\nNext birthday: ${result.nextBdayFormatted}\n(${result.daysUntilBday} days away)\n──────────────────\nCalculated on toolra.io`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waMessage = result
    ? `I am ${result.years} years, ${result.months} months and ${result.days} days old! 🎂\nI've lived ${fmtNum(result.totalDays)} days — that's ${fmtNum(liveSeconds)} seconds!\nMy next birthday is in ${result.daysUntilBday} days.\nCalculated using Toolra 🔗 toolra.io`
    : ""
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  const FACTS = result ? [
    { icon: '🗓️', label: 'Born on a', value: result.dayBorn },
    { icon: '⭐', label: 'Zodiac sign', value: result.zodiac },
    { icon: '❤️', label: 'Heartbeats', value: '~' + fmtNum(result.heartbeats), sub: '72 BPM avg' },
    { icon: '🌬️', label: 'Breaths taken', value: '~' + fmtNum(result.breaths), sub: '16/min avg' },
    { icon: '🌍', label: 'Leap years lived', value: result.leapYears },
    { icon: '😴', label: 'Years slept', value: '~' + result.yearsSlept + ' yrs', sub: '8hrs/day avg' },
    { icon: '🎂', label: 'Birthdays', value: result.birthdays },
    { icon: '📅', label: 'Days until B-day', value: result.daysUntilBday + ' days' }
  ] : []

  let diff = null
  if (dob && dobB && mode === 'agediff') {
    if (dob === dobB) {
      diff = { same: true }
    } else {
      const aOlder = new Date(dob) < new Date(dobB)
      const d = aOlder ? calcAge(dob, dobB) : calcAge(dobB, dob)
      diff = { same: false, aOlder, years: d.years, months: d.months, days: d.days }
    }
  }

  let explanation = "Enter your date of birth above to see a detailed breakdown of your exact age and fascinating life statistics."
  if (mode === 'myage' && result) {
    explanation = `You are exactly ${result.years} years, ${result.months} months and ${result.days} days old. You've been alive for ${fmtNum(result.totalDays)} days — that's ${fmtNum(liveSeconds)} seconds of experiences, memories and growth. Your next birthday is in ${result.daysUntilBday} days on ${result.nextBdayFormatted}.`
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <Link to="/tools" className="text-xs text-[#CBFF00] opacity-70 hover:opacity-100 mb-6 block">
        ← All tools
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">Age Calculator</h1>
          <p className="text-sm text-[#6b6b80]">
            Calculate your exact age and discover fascinating facts about your life.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("myage")}
            className={mode === "myage"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
              : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
          >
            My Age
          </button>
          <button
            type="button"
            onClick={() => setMode("agediff")}
            className={mode === "agediff"
              ? "bg-[#CBFF00] text-[#0a0a0f] rounded-xl px-4 py-2 text-sm font-medium"
              : "border border-[rgba(255,255,255,0.1)] text-[#6b6b80] rounded-xl px-4 py-2 text-sm"}
          >
            Age Difference
          </button>
        </div>
      </div>

      {mode === 'myage' ? (
        <>
          {/* Main card */}
          <div className="bg-[#111118] rounded-3xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
              {/* Left column */}
              <div>
                <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Date of birth</label>
                <input
                  type="date"
                  max={today}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-base outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)]"
                />

                <div className="mt-4">
                  <p className="text-xs text-[#6b6b80] mb-2">Quick fill</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AGE_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setDob(p.date)}
                        className={dob === p.date
                          ? "bg-[#CBFF00] text-[#0a0a0f] text-xs rounded-lg py-2"
                          : "bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] text-[#6b6b80] text-xs rounded-lg py-2"}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#f0f0f5] font-medium">Calculate age as of</span>
                    <span className="text-[#6b6b80]">⚙️</span>
                  </div>
                  <input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-base outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)]"
                  />
                </div>

                <div className="mt-2">
                  <p className="text-xs text-[#CBFF00] opacity-70 mb-2">Exam cutoffs</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAM_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setAsOfDate(p.date)}
                        className={asOfDate === p.date
                          ? "bg-[rgba(203,255,0,0.15)] text-[#CBFF00] border border-[rgba(203,255,0,0.3)] rounded-full px-3 py-1 text-xs"
                          : "border border-[rgba(255,255,255,0.08)] text-[#6b6b80] rounded-full px-3 py-1 text-xs"}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 bg-[rgba(203,255,0,0.04)] rounded-xl p-3 border border-[rgba(203,255,0,0.1)]">
                  <p className="text-xs text-[#6b6b80] leading-relaxed">
                    💡 UPSC General: 21–32 | OBC: 21–35 | SC/ST: 21–37 (as of cutoff date)
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div ref={resultRef}>
                {!result && (
                  <div className="h-full flex items-center justify-center min-h-[200px]">
                    <p className="text-sm text-[#6b6b80]">Select your date of birth to calculate</p>
                  </div>
                )}

                {result && (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-[#0a0a0f] rounded-2xl p-5 text-center border border-[rgba(255,255,255,0.04)]">
                        <p className="text-6xl font-bold text-[#CBFF00]">{result.years}</p>
                        <p className="text-xs uppercase tracking-widest text-[#6b6b80] mt-1">Years</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-2xl p-5 text-center border border-[rgba(255,255,255,0.04)]">
                        <p className="text-6xl font-bold text-[#f0f0f5]">{result.months}</p>
                        <p className="text-xs uppercase tracking-widest text-[#6b6b80] mt-1">Months</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-2xl p-5 text-center border border-[rgba(255,255,255,0.04)]">
                        <p className="text-6xl font-bold text-[#f0f0f5]">{result.days}</p>
                        <p className="text-xs uppercase tracking-widest text-[#6b6b80] mt-1">Days</p>
                      </div>
                    </div>

                    <div className="bg-[#0a0a0f] rounded-2xl p-5 mb-4 border border-[rgba(255,255,255,0.04)] relative">
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                        <span className="text-[10px] text-[#22c55e] tracking-widest">LIVE COUNTER</span>
                      </div>
                      <p className="text-5xl font-bold font-mono text-[#CBFF00]">{fmtNum(liveSeconds)} sec</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] text-center">
                        <p className="text-xs text-[#6b6b80] mb-1">Total Weeks</p>
                        <p className="text-lg font-semibold text-[#f0f0f5]">{fmtNum(result.totalWeeks)}</p>
                      </div>
                      <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] text-center">
                        <p className="text-xs text-[#6b6b80] mb-1">Total Days</p>
                        <p className="text-lg font-semibold text-[#f0f0f5]">{fmtNum(result.totalDays)}</p>
                      </div>
                      <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] text-center">
                        <p className="text-xs text-[#6b6b80] mb-1">Total Hours</p>
                        <p className="text-lg font-semibold text-[#f0f0f5]">{fmtNum(result.totalHours)}</p>
                      </div>
                      <div className="bg-[#1a1a24] rounded-xl p-3 border border-[rgba(255,255,255,0.04)] text-center">
                        <p className="text-xs text-[#6b6b80] mb-1">Total Minutes</p>
                        <p className="text-lg font-semibold text-[#f0f0f5]">{(result.totalMinutes / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>

                    <div className="bg-[#111118] rounded-2xl p-5 mb-4 border border-[rgba(255,255,255,0.06)]">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <span className="text-2xl">🎂</span>
                          <div>
                            <p className="font-medium text-[#f0f0f5]">Next Birthday</p>
                            <p className="text-xs text-[#6b6b80] mt-0.5">
                              {result.nextBday.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-[#CBFF00]">{result.daysUntilBday}</p>
                          <p className="text-xs text-[#6b6b80]">Days away</p>
                        </div>
                      </div>

                      <div className="relative h-2.5 bg-[#1a1a24] rounded-full mt-4 mb-2">
                        <div
                          className="absolute left-0 h-full bg-[#CBFF00] rounded-full transition-all duration-500"
                          style={{ width: `${result.yearProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-[#6b6b80]">Last B-Day</span>
                        <span className="text-[10px] text-[#6b6b80]">{result.yearProgress}% of current year completed</span>
                        <span className="text-[10px] text-[#6b6b80]">Next B-Day</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
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

          {/* Your Life File */}
          <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] mb-6">
            <div
              className="p-5 flex justify-between items-center cursor-pointer"
              onClick={() => setShowLifeFile((v) => !v)}
            >
              <div>
                <p className="text-base font-medium text-[#f0f0f5]">✨ Your Life File</p>
                <p className="text-xs text-[#6b6b80] mt-0.5">Curious stats based on your exact age</p>
              </div>
              <span className="text-[#CBFF00] text-sm">{showLifeFile ? "Hide ▴" : "Show ▾"}</span>
            </div>

            {showLifeFile && (
              <div className="p-5 pt-0">
                {result ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FACTS.map((f, i) => (
                      <div key={i} className="bg-[#1a1a24] rounded-xl p-4 border border-[rgba(255,255,255,0.04)]">
                        <p className="text-2xl mb-2">{f.icon}</p>
                        <p className="text-[10px] text-[#6b6b80] uppercase tracking-wide mb-1">{f.label}</p>
                        <p className="text-lg font-semibold text-[#f0f0f5]">{f.value}</p>
                        {f.sub && <p className="text-[10px] text-[#6b6b80] mt-0.5">{f.sub}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6b6b80] text-center py-6">Select your date of birth to see life stats</p>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Age difference mode */
        <div className="max-w-lg mx-auto bg-[#111118] rounded-3xl p-8 border border-[rgba(255,255,255,0.06)] mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Person A — Date of birth</label>
              <input
                type="date"
                max={today}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-base outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6b6b80] uppercase tracking-wide mb-2">Person B — Date of birth</label>
              <input
                type="date"
                max={today}
                value={dobB}
                onChange={(e) => setDobB(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#f0f0f5] text-base outline-none focus:border-[#CBFF00] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.15)]"
              />
            </div>
          </div>

          {diff && (
            <div className="bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.25)] rounded-2xl p-6 mt-6 text-center">
              {diff.same ? (
                <p className="text-xl font-semibold text-[#22c55e]">🎉 They were born on the same day!</p>
              ) : (
                <>
                  <p className="text-sm text-[#6b6b80]">{diff.aOlder ? "Person A is" : "Person B is"}</p>
                  <p className="text-3xl font-bold text-[#CBFF00]">
                    {diff.years} yrs, {diff.months} mo, {diff.days} days older
                  </p>
                  <p className="text-sm text-[#6b6b80]">{diff.aOlder ? "than Person B" : "than Person A"}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

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
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How is age calculated?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Age is calculated by finding the exact difference between your date of birth and today's date (or a reference date). The calculation accounts for varying month lengths and leap years to give precise years, months, and days.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">What is the importance of leap years?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            A leap year occurs every 4 years and has 366 days instead of 365. This affects age calculations — someone born on February 29 only has a true birthday every 4 years. Our calculator accounts for all leap years precisely.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#f0f0f5] mb-2">How to check exam age eligibility?</h2>
          <p className="text-sm text-[#6b6b80] leading-relaxed">
            Most Indian competitive exams (UPSC, SSC, IBPS) calculate age as of a specific cutoff date — not today. Use the 'Calculate age as of' field and select the exam cutoff date preset to check your exact eligibility instantly.
          </p>
        </div>
      </div>
    </div>
  )
}
