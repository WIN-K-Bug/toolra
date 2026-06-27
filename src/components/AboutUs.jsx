import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const TOOL_LINKS = [
  { name: "GST Calculator", path: "/tools/gst-calculator", blurb: "updated for GST 2.0 (Sep 2025)" },
  { name: "EMI Calculator", path: "/tools/emi-calculator", blurb: "home, car, personal, education" },
  { name: "Income Tax Calculator", path: "/tools/income-tax-calculator", blurb: "FY 2025-26 old vs new regime" },
  { name: "SIP Returns Calculator", path: "/tools/sip-calculator", blurb: "with step-up SIP support" },
  { name: "Age Calculator", path: "/tools/age-calculator", blurb: "with exam eligibility check" },
  { name: "CGPA to Percentage", path: "/tools/cgpa-to-percentage", blurb: "all Indian universities" },
  { name: "Number Base Converter", path: "/tools/number-base-converter", blurb: "decimal, binary, octal, hex" }
]

const COMMITMENTS = [
  "Completely free — no subscription, no login",
  "Ad-supported to keep the service free",
  "Updated regularly to reflect current rates and regulations",
  "Privacy-friendly — all calculations happen in your browser",
  "Mobile-responsive — works on any device"
]

export default function AboutUs() {
  useEffect(() => {
    document.title = 'About Toolra — Free Online Calculators'
  }, [])

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#f0f0f5] mb-2">About Toolra</h1>
        <p className="text-[#6b6b80] text-sm mb-10">
          Free, accurate tools for Indian students, developers and professionals.
        </p>

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">What is Toolra?</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Toolra is a collection of free online calculators and converters built for everyday use.
          Our tools cover financial calculations, academic conversions, developer utilities, and
          more — all in one place.
        </p>
        <p className="text-sm text-[#6b6b80] leading-relaxed mt-3">
          Every tool on Toolra is built with a focus on accuracy, speed, and simplicity. We use
          official government rates, verified formulas, and up-to-date data to ensure our results
          are reliable.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Our tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOOL_LINKS.map(t => (
            <Link key={t.path} to={t.path} className="text-[#CBFF00] hover:underline text-sm">
              {t.name} — {t.blurb}
            </Link>
          ))}
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Our commitment</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed mb-3">All tools on Toolra are:</p>
        <ul className="space-y-2">
          {COMMITMENTS.map(c => (
            <li key={c} className="text-sm text-[#6b6b80] leading-relaxed flex gap-2">
              <span className="text-[#CBFF00]">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Accuracy disclaimer</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          While we make every effort to ensure accuracy, Toolra's tools are intended for
          informational and estimation purposes. For financial decisions, tax filings, or
          academic submissions, always verify results with official sources or a qualified
          professional.
        </p>

        <div className="bg-[rgba(203,255,0,0.05)] border border-[rgba(203,255,0,0.15)] rounded-2xl p-6 mt-10">
          <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">Have a tool idea?</h3>
          <p className="text-sm text-[#6b6b80] mb-4">
            We're always looking to add tools that solve real problems. If there's a calculator or
            converter you wish existed, we'd love to hear it.
          </p>
          <Link
            to="/contact"
            className="border border-[rgba(203,255,0,0.4)] text-[#CBFF00] text-sm px-4 py-2 rounded-xl inline-block hover:bg-[rgba(203,255,0,0.08)] transition"
          >
            Suggest a tool →
          </Link>
        </div>
      </div>
    </div>
  )
}
