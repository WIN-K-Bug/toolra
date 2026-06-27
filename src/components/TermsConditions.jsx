import { useEffect } from 'react'

export default function TermsConditions() {
  useEffect(() => {
    document.title = 'Terms & Conditions — Toolra'
  }, [])

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#f0f0f5] mb-2">Terms & Conditions</h1>
        <p className="text-[#6b6b80] text-sm mb-10">Last updated: June 2025</p>

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Acceptance of terms</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          By accessing and using Toolra, you agree to be bound by these Terms and Conditions. If
          you do not agree, please do not use our services.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Use of tools</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Toolra provides free online calculators and converters for informational purposes only.
          The results produced by our tools are estimates and should not be used as a substitute
          for professional financial, legal, or academic advice.
        </p>
        <p className="text-sm text-[#6b6b80] leading-relaxed mt-3">
          All GST, income tax, and EMI calculations are based on publicly available rates and
          formulas. Always verify critical figures with a qualified professional before making
          financial decisions.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Intellectual property</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          All content on Toolra, including tool designs, code, and written content, is the
          property of Toolra. You may not copy, reproduce, or redistribute any part of this site
          without written permission.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Disclaimer of warranties</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Toolra is provided "as is" without warranties of any kind. We do not guarantee the
          accuracy, completeness, or suitability of any tool for your specific purpose.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Limitation of liability</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Toolra shall not be liable for any direct, indirect, or consequential damages arising
          from your use of our tools or reliance on the results they produce.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Governing law</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          These terms are governed by the laws of India. Any disputes shall be subject to the
          jurisdiction of courts in India.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Changes to terms</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          We reserve the right to modify these terms at any time. Continued use of Toolra after
          any changes constitutes your acceptance of the new terms.
        </p>
      </div>
    </div>
  )
}
