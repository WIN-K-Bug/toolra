import { useState, useEffect } from 'react'

export default function FAQSection({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    })
    script.id = 'faq-schema'
    const existing = document.getElementById('faq-schema')
    if (existing) existing.remove()
    document.head.appendChild(script)
    return () => {
      const s = document.getElementById('faq-schema')
      if (s) s.remove()
    }
  }, [faqs])

  return (
    <div className="mt-10 mb-12">
      <h2 className="text-xl font-semibold text-[#f0f0f5] mb-6">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`border rounded-xl transition-all duration-200 ${
              openIndex === i
                ? 'border-[rgba(203,255,0,0.3)] bg-[rgba(203,255,0,0.04)]'
                : 'border-[rgba(255,255,255,0.06)] bg-[#111118]'
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className={`text-sm font-medium ${
                openIndex === i ? 'text-[#CBFF00]' : 'text-[#f0f0f5]'
              }`}>
                {faq.question}
              </span>
              <span className={`text-lg flex-shrink-0 ml-4 transition-transform duration-200 ${
                openIndex === i ? 'rotate-45 text-[#CBFF00]' : 'text-[#6b6b80]'
              }`}>
                +
              </span>
            </button>

            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
