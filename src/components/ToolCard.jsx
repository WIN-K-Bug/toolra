import { Link } from 'react-router-dom'
import {
  IconReceiptTax,
  IconBuildingBank,
  IconChartBar,
  IconTrendingUp,
  IconCalendarEvent,
  IconSchool,
  IconBinaryTree,
  IconTool
} from '@tabler/icons-react'

const ICONS = {
  IconReceiptTax,
  IconBuildingBank,
  IconChartBar,
  IconTrendingUp,
  IconCalendarEvent,
  IconSchool,
  IconBinaryTree,
  IconTool
}

export default function ToolCard({ tool }) {
  const IconComponent = ICONS[tool.iconName] || IconTool

  return (
    <Link
      to={tool.path}
      className="group relative flex flex-col bg-[#13131a] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:border-[rgba(203,255,0,0.35)] hover:-translate-y-1 hover:bg-[#16161f] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-200 block min-h-[200px] h-full"
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between mb-4 min-h-[40px]">
        {/* Icon box */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: tool.colorDim,
            border: `1px solid ${tool.colorBorder}`
          }}
        >
          <IconComponent size={20} stroke={1.75} style={{ color: tool.color }} />
        </div>

        {/* Badge */}
        {tool.badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${
            tool.badgeType === 'popular'
              ? 'bg-[rgba(127,119,221,0.15)] text-[#a5a0ee] border border-[rgba(127,119,221,0.25)]'
              : 'bg-[rgba(34,197,94,0.12)] text-[#22c55e] border border-[rgba(34,197,94,0.25)]'
          }`}>
            {tool.badge}
          </span>
        )}
      </div>

      {/* Tool name */}
      <h3 className="text-[#f0f0f5] font-semibold text-[15px] mb-1.5 leading-snug">
        {tool.name}
      </h3>

      {/* Description */}
      <p
        className="text-[#6b6b80] text-[13px] leading-relaxed mb-4 flex-1 overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {tool.description}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto">
        {/* Category pill */}
        <span
          className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
          style={{
            background: tool.colorDim,
            color: tool.color,
            border: `1px solid ${tool.colorBorder}`
          }}
        >
          {tool.category}
        </span>

        {/* Launch CTA */}
        <span className="text-[13px] text-[#CBFF00] font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Launch
          <span className="group-hover:translate-x-0.5 transition-transform inline-block">
            →
          </span>
        </span>
      </div>

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${tool.colorDim}, transparent 70%)`
        }}
      />
    </Link>
  )
}
