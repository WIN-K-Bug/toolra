import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import TOOLS_DATA from './data/tools'

const Homepage = lazy(() => import('./components/Homepage'))
const ToolsDirectory = lazy(() => import('./components/ToolsDirectory'))
const NotFound = lazy(() => import('./components/NotFound'))
const CGPACalculator = lazy(() => import('./components/CGPACalculator'))
const AgeCalculator = lazy(() => import('./components/AgeCalculator'))
const GSTCalculator = lazy(() => import('./components/GSTCalculator'))
const EMICalculator = lazy(() => import('./components/EMICalculator'))
const IncomeTaxCalculator = lazy(() => import('./components/IncomeTaxCalculator'))
const SIPCalculator = lazy(() => import('./components/SIPCalculator'))
const BaseConverter = lazy(() => import('./components/BaseConverter'))
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./components/TermsConditions'))
const AboutUs = lazy(() => import('./components/AboutUs'))
const ContactUs = lazy(() => import('./components/ContactUs'))

const NAV_LINKS = ['/', '/tools', '/blog']
const NAV_LABELS = ['Home', 'Tools', 'Blog']

const STATIC_PAGE_TITLES = {
  '/privacy': 'Privacy Policy — Toolra',
  '/terms': 'Terms & Conditions — Toolra',
  '/about': 'About Toolra — Free Online Calculators',
  '/contact': 'Contact Toolra'
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location])

  useEffect(() => {
    const tool = TOOLS_DATA.find(t => t.path === location.pathname)
    if (location.pathname === '/') {
      document.title = 'Toolra — Free Online Calculators for India'
    } else if (location.pathname === '/tools') {
      document.title = 'All Tools — Toolra'
    } else if (tool) {
      document.title = `${tool.name} — Toolra`
    } else if (STATIC_PAGE_TITLES[location.pathname]) {
      document.title = STATIC_PAGE_TITLES[location.pathname]
    } else {
      document.title = 'Page Not Found — Toolra'
    }
  }, [location.pathname])

  return (
    <div className="bg-[#0a0a0f] min-h-screen w-full">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-[#CBFF00] tracking-tight">
              Toolra
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-full px-1 py-1 gap-1">
            {NAV_LINKS.map((path, i) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  location.pathname === path
                    ? 'bg-[rgba(203,255,0,0.12)] text-[#CBFF00] font-medium'
                    : 'text-[#6b6b80] hover:text-[#f0f0f5]'
                }`}
              >
                {NAV_LABELS[i]}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="hidden sm:block border border-[rgba(203,255,0,0.5)] text-[#CBFF00] text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[rgba(203,255,0,0.08)] transition"
            >
              All Tools
            </Link>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden text-[#6b6b80] text-xl"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-[#111118] border-t border-[rgba(255,255,255,0.06)] px-4 py-4 space-y-1">
            <Link to="/" className="block py-2 text-sm text-[#f0f0f5]">Home</Link>
            <Link to="/tools" className="block py-2 text-sm text-[#f0f0f5]">All Tools</Link>
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 mt-2">
              <p className="text-[10px] text-[#6b6b80] uppercase tracking-wide mb-2">Tools</p>
              {TOOLS_DATA.map(t => (
                <Link
                  key={t.path}
                  to={t.path}
                  className="block py-1.5 text-sm text-[#6b6b80] hover:text-[#CBFF00]"
                >
                  {t.icon} {t.name}
                </Link>
              ))}
            </div>
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 mt-2 flex gap-4">
              <Link to="/privacy" className="text-xs text-[#6b6b80] hover:text-[#CBFF00]">Privacy</Link>
              <Link to="/terms" className="text-xs text-[#6b6b80] hover:text-[#CBFF00]">Terms</Link>
              <Link to="/about" className="text-xs text-[#6b6b80] hover:text-[#CBFF00]">About</Link>
              <Link to="/contact" className="text-xs text-[#6b6b80] hover:text-[#CBFF00]">Contact</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb — only for tool pages that don't render their own */}
      {location.pathname.startsWith('/tools/') &&
        !TOOLS_DATA.some(t => t.path === location.pathname) && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <Link to="/tools" className="text-xs text-[#CBFF00] opacity-60 hover:opacity-100 transition">
            ← All tools
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-8 pb-16 min-h-[calc(100vh-130px)] flex flex-col">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#CBFF00] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#6b6b80]">Loading tool...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/tools" element={<ToolsDirectory />} />
            <Route path="/tools/cgpa-to-percentage" element={<CGPACalculator />} />
            <Route path="/tools/age-calculator" element={<AgeCalculator />} />
            <Route path="/tools/gst-calculator" element={<GSTCalculator />} />
            <Route path="/tools/emi-calculator" element={<EMICalculator />} />
            <Route path="/tools/income-tax-calculator" element={<IncomeTaxCalculator />} />
            <Route path="/tools/sip-calculator" element={<SIPCalculator />} />
            <Route path="/tools/number-base-converter" element={<BaseConverter />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.04)] mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div>
              <div className="text-lg font-bold text-[#CBFF00]">Toolra</div>
              <div className="text-xs text-[#6b6b80] mt-0.5">
                Tools that just work.
              </div>
            </div>
            <div className="flex gap-6 text-sm text-[#6b6b80]">
              <Link to="/tools" className="hover:text-[#f0f0f5] transition">All Tools</Link>
              <Link to="/about" className="hover:text-[#f0f0f5] transition">About</Link>
              <Link to="/privacy" className="hover:text-[#f0f0f5] transition">Privacy</Link>
              <Link to="/terms" className="hover:text-[#f0f0f5] transition">Terms</Link>
              <Link to="/contact" className="hover:text-[#f0f0f5] transition">Contact</Link>
            </div>
          </div>
          <div className="text-center text-[10px] text-[#6b6b80] opacity-40">
            © {new Date().getFullYear()} Toolra · Free tools for India · No login · No ads · Built with ❤ in India
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
