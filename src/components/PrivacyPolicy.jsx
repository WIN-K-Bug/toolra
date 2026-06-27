import { useEffect } from 'react'

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy — Toolra'
  }, [])

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#f0f0f5] mb-2">Privacy Policy</h1>
        <p className="text-[#6b6b80] text-sm mb-10">Last updated: June 2025</p>

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Information we collect</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          We do not collect any personal information. Toolra does not require you to create an
          account or log in to use any of our tools. All calculations are performed entirely in
          your browser — no data is sent to our servers.
        </p>
        <p className="text-sm text-[#6b6b80] leading-relaxed mt-3">
          We use Google Analytics to collect anonymous usage data such as page views and session
          duration. This data is aggregated and cannot be used to identify you personally.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Cookies</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Toolra uses cookies through Google Analytics and Google AdSense. These cookies help us
          understand how visitors use our site and allow us to serve relevant advertisements. You
          can disable cookies in your browser settings at any time.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Google AdSense</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          We use Google AdSense to display advertisements. Google may use cookies to serve ads
          based on your prior visits to our site or other websites. You can opt out of
          personalized advertising by visiting Google's Ads Settings.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Third-party links</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          Our site may contain links to external websites. We are not responsible for the privacy
          practices or content of those sites.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Changes to this policy</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this
          page with an updated date.
        </p>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-8" />

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Contact</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed">
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:contact@toolra.io" className="text-[#CBFF00] hover:underline">
            contact@toolra.io
          </a>.
        </p>
      </div>
    </div>
  )
}
