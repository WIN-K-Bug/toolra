import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import TOOLS_DATA from '../data/tools'
import ToolCard from './ToolCard'

const CATEGORIES = [
  { label: 'All', count: 7 },
  { label: 'Finance', count: 4 },
  { label: 'Students', count: 1 },
  { label: 'Developers', count: 1 },
  { label: 'Everyday', count: 1 }
]

export default function Homepage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = TOOLS_DATA.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[rgba(203,255,0,0.07)] blur-[120px]" />
        <div className="absolute top-48 -right-32 w-[400px] h-[400px] rounded-full bg-[rgba(127,119,221,0.06)] blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex items-center gap-2 bg-[rgba(203,255,0,0.08)] border border-[rgba(203,255,0,0.2)] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBFF00] animate-pulse inline-block" />
          <span className="text-xs text-[#CBFF00] tracking-wide">
            Updated · GST 2.0 slabs effective Sep 2025
          </span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold leading-tight tracking-tight mb-4">
          <span className="text-[#f0f0f5]">Tools that</span>
          <br />
          <span className="text-[#CBFF00] italic relative inline-block">
            just work.
            <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CBFF00] to-transparent" />
          </span>
        </h1>

        <p className="text-[#6b6b80] text-lg max-w-lg mx-auto leading-relaxed mb-8">
          7 free calculators for Indian students, developers and professionals — no login,
          no ads, instant results.
        </p>

        <div className="relative w-full max-w-[520px] mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CBFF00] opacity-60">
            🔍
          </span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools... e.g. GST, EMI, CGPA"
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(203,255,0,0.25)] rounded-2xl py-4 pl-11 pr-16 text-[#f0f0f5] text-base outline-none placeholder-[#6b6b80] focus:border-[rgba(203,255,0,0.6)] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.1)] transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1a1a24] text-[#6b6b80] text-xs px-2 py-1 rounded-md border border-[rgba(255,255,255,0.08)]">
            /
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6b6b80]">
          <span>7 free tools</span>
          <span className="opacity-30">·</span>
          <span>No login required</span>
          <span className="opacity-30">·</span>
          <span className="text-[#CBFF00] opacity-80">Updated for FY 2025-26</span>
        </div>
      </section>

      {/* What's new banner */}
      <div className="relative z-10 border-t border-b border-[rgba(255,255,255,0.04)] bg-[#111118] -mx-4 px-4">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between border-l-4 border-[#CBFF00]">
          <div className="flex items-center gap-3">
            <span className="text-[#CBFF00] text-sm">✦</span>
            <span className="text-sm">
              <span className="text-[#f0f0f5] font-medium">Updated:</span>
              <span className="text-[#6b6b80] ml-1.5">
                GST Calculator now reflects GST 2.0 slabs effective September 22, 2025
              </span>
            </span>
          </div>
          <Link to="/tools/gst-calculator" className="text-sm text-[#CBFF00] hover:underline whitespace-nowrap ml-4">
            View tool →
          </Link>
        </div>
      </div>

      {/* Category filters */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`px-5 py-2 rounded-full text-sm transition-all font-medium ${
                activeCategory === cat.label
                  ? 'bg-[#CBFF00] text-[#0a0a0f]'
                  : 'border border-[rgba(255,255,255,0.1)] text-[#6b6b80] hover:border-[rgba(203,255,0,0.3)] hover:text-[#f0f0f5]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </section>

      <div className="text-center mb-6">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b80]">
          Popular tools
        </span>
      </div>

      {/* Tool cards */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-[#f0f0f5] font-medium mb-2">
                No tools found for "{search}"
              </p>
              <p className="text-sm text-[#6b6b80]">
                Try searching for GST, EMI, tax, age, CGPA or binary
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 border border-[rgba(203,255,0,0.3)] text-[#CBFF00] text-sm px-4 py-2 rounded-xl hover:bg-[rgba(203,255,0,0.06)] transition"
              >
                Clear search
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {filtered.map((tool, index) => {
              const isLastOdd = filtered.length % 2 !== 0 && index === filtered.length - 1
              return (
                <div key={tool.id} className={isLastOdd ? 'sm:col-start-2 lg:col-start-2' : ''}>
                  <ToolCard tool={tool} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-t border-b border-[rgba(255,255,255,0.04)] bg-[#111118] py-12 px-4 -mx-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.04)] rounded-2xl overflow-hidden">
          {[
            { num: '7', label: 'Free tools', sub: 'Available now' },
            { num: '0', label: 'Login required', sub: 'Instant access' },
            { num: '100%', label: 'Free forever', sub: 'No credit card' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#111118] py-10 text-center">
              <div className="text-5xl font-bold text-[#CBFF00] mb-1">{stat.num}</div>
              <div className="text-sm text-[#f0f0f5] font-medium">{stat.label}</div>
              <div className="text-xs text-[#6b6b80] mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggest a tool */}
      <section className="relative z-10 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#111118] rounded-2xl p-8 border border-dashed border-[rgba(203,255,0,0.2)]">
          <div className="w-12 h-12 rounded-full bg-[rgba(203,255,0,0.1)] border border-[rgba(203,255,0,0.2)] flex items-center justify-center text-xl mx-auto mb-4">
            💡
          </div>
          <h3 className="text-lg font-semibold text-[#f0f0f5] mb-2">
            Got a tool idea?
          </h3>
          <p className="text-sm text-[#6b6b80] mb-6 leading-relaxed">
            Tell us what to build next. We add tools our users actually need — for free.
          </p>
          <a
            href="mailto:hello@toolra.io"
            className="border border-[rgba(203,255,0,0.4)] text-[#CBFF00] text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[rgba(203,255,0,0.06)] transition inline-block"
          >
            Suggest a tool →
          </a>
        </div>
      </section>
    </div>
  )
}
