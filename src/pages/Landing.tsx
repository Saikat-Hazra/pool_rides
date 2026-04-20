import React from 'react'
import { Link } from 'react-router-dom'
import { Car, Shield, TrendingDown, Users, ChevronRight, CheckCircle, MapPin } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Create your profile',
    desc: 'Sign up with your college email and tell us your daily commute route.',
  },
  {
    num: '02',
    title: 'Find or create a pool',
    desc: 'Discover verified students going your way at the same time, every day.',
  },
  {
    num: '03',
    title: 'Ride together, save together',
    desc: 'Track your savings every week. The more rides you share, the more you save.',
  },
]

const SAVINGS_EXAMPLES = [
  { route: 'Marathahalli → RVCE', solo: 380, pooled: 100, riders: 4 },
  { route: 'HSR Layout → PES University', solo: 320, pooled: 117, riders: 3 },
  { route: 'Electronic City → Christ', solo: 480, pooled: 125, riders: 4 },
]

const FAQS = [
  {
    q: 'Is PoolRides safe?',
    a: 'Yes. All users are verified through their campus email or admin review. You can also filter for women-only pools and verified-student-only rides.',
  },
  {
    q: 'How do I split the cost?',
    a: 'The app automatically divides the estimated fare equally among all confirmed riders. You coordinate payment directly (UPI, cash) — no in-app payments needed.',
  },
  {
    q: 'What if my pool has no takers?',
    a: "You can share a join link to WhatsApp or leave the pool open and we'll suggest it to matching students nearby.",
  },
  {
    q: 'Which colleges are supported?',
    a: 'We currently support RVCE, PES University, Christ University, Scaler School of Technology, BMS College of Engineering, and Jain University in Bengaluru.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Public Navbar ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-teal-700 text-lg">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            PoolRides
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
              Join free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Gradient background — landing page only */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium mb-6 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Now live on Bengaluru campuses
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 text-balance">
            Split your daily commute with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
              verified students
            </span>{' '}
            going your way
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 text-balance">
            Stop paying solo cab fares every day. PoolRides matches you with real students from your
            campus traveling the same route at the same time — so you save money, every single day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Find your pool <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { value: '₹3,200+', label: 'Average monthly savings' },
              { value: '6', label: 'Bengaluru colleges' },
              { value: '10+', label: 'Active corridors' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-teal-700">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────── */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Three steps to go from daily solo rides to a reliable, affordable commute with your
              campus community.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-lg mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Savings Examples ──────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">See the savings</h2>
            <p className="text-gray-500">Real Bengaluru commute corridors. Real numbers.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {SAVINGS_EXAMPLES.map((ex) => (
              <div key={ex.route} className="card">
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="font-medium">{ex.route}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Solo fare</div>
                    <div className="text-xl font-bold text-gray-400 line-through">₹{ex.solo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-0.5">Pooled ({ex.riders} riders)</div>
                    <div className="text-2xl font-bold text-teal-700">₹{ex.pooled}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-green-600 font-semibold text-sm">
                    Save ₹{ex.solo - ex.pooled} per ride · ₹{(ex.solo - ex.pooled) * 22}/month
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust section ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Built for trust, not just convenience
              </h2>
              <p className="text-gray-500 mb-6">
                PoolRides is not an open marketplace. It's a closed, campus-verified community where
                you know the people you're riding with.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Campus email verification for all users',
                  'Women-only pool options',
                  'Creator approval for every join request',
                  'Report and admin review system',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Campus Verified', desc: 'Only real students' },
                { icon: Users, label: 'Peer Matching', desc: 'Same college priority' },
                { icon: TrendingDown, label: 'Cost Savings', desc: 'Track every rupee' },
                { icon: Car, label: 'Recurring Routes', desc: 'Daily commute built-in' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card p-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-0.5">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" id="faq">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently asked questions</h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA footer ────────────────────────────────── */}
      <section className="py-20 bg-teal-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to start saving?</h2>
          <p className="text-teal-200 mb-8">
            Join your campus pool today and see how much you save this week.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 btn-primary bg-white text-teal-700 hover:bg-teal-50 px-8 py-3 text-base">
            Get started free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-white font-semibold mb-2">
          <Car className="w-4 h-4 text-teal-400" />
          PoolRides
        </div>
        <p>© 2026 PoolRides · Built for Bengaluru students</p>
      </footer>
    </div>
  )
}
