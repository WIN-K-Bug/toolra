import { useState } from 'react'
import TOOLS_DATA from '../data/tools'
import ToolCard from './ToolCard'

const CATEGORIES = [
  { label: 'All', count: 7 },
  { label: 'Finance', count: 4 },
  { label: 'Students', count: 1 },
  { label: 'Developers', count: 1 },
  { label: 'Everyday', count: 1 }
]

export default function ToolsDirectory() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = TOOLS_DATA.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="bg-[#0a0a0f] min-h-screen -mx-4 -mt-8 -mb-16 px-4 pt-8 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#f0f0f5] mb-2">All Tools</h1>
          <p className="text-[#6b6b80] text-sm">
            7 free calculators and converters — no signup, no clutter
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-[520px] mx-auto mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CBFF00] opacity-60">
            🔍
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools... e.g. GST, EMI, CGPA"
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(203,255,0,0.2)] rounded-2xl py-4 pl-11 pr-4 text-[#f0f0f5] text-base outline-none placeholder-[#6b6b80] focus:border-[rgba(203,255,0,0.5)] focus:shadow-[0_0_0_3px_rgba(203,255,0,0.1)] transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
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

        {/* No results */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8 items-stretch">
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
    </div>
  )
}
