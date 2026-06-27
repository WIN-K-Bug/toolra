import { useEffect } from 'react'

const INFO_CARDS = [
  {
    icon: "🐛",
    title: "Found a bug?",
    body: "If a tool is giving wrong results, let us know and we'll fix it fast."
  },
  {
    icon: "💡",
    title: "Tool suggestion?",
    body: "Have an idea for a new calculator or converter? We build what users need."
  },
  {
    icon: "📢",
    title: "General feedback?",
    body: "Tell us what you love, what to improve, or anything else on your mind."
  }
]

export default function ContactUs() {
  useEffect(() => {
    document.title = 'Contact Toolra'
  }, [])

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#f0f0f5] mb-2">Contact Us</h1>
        <p className="text-[#6b6b80] text-sm mb-10">We'd love to hear from you.</p>

        <h2 className="text-base font-semibold text-[#f0f0f5] mt-8 mb-2">Get in touch</h2>
        <p className="text-sm text-[#6b6b80] leading-relaxed mb-4">
          Whether you've found an error in one of our tools, have a suggestion for a new
          calculator, or just want to say hello — we read every message.
        </p>

        <a
          href="mailto:contact@toolra.io"
          className="text-[#CBFF00] text-lg font-medium hover:underline"
        >
          contact@toolra.io
        </a>
        <p className="text-xs text-[#6b6b80] mt-2">
          We typically respond within 2–3 business days.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {INFO_CARDS.map(card => (
            <div
              key={card.title}
              className="bg-[#111118] rounded-xl p-5 border border-[rgba(255,255,255,0.06)]"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="text-sm font-semibold text-[#f0f0f5] mb-1">{card.title}</h3>
              <p className="text-xs text-[#6b6b80]">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#111118] rounded-xl p-5 mt-8 border border-[rgba(255,255,255,0.06)]">
          <p className="text-sm text-[#6b6b80]">
            Please note: Toolra does not provide financial, tax, or legal advice. For professional
            guidance, consult a qualified advisor.
          </p>
        </div>
      </div>
    </div>
  )
}
