import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import heroImage from '@/assets/Hero.png'

const stats = [
  { label: 'Registered Donors', value: '500+' },
  { label: 'Cities Covered', value: '20+' },
  { label: 'Blood Groups', value: '8' },
  { label: 'Available 24/7', value: '✓' },
]

const steps = [
  {
    icon: (
      <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Register',
    description: 'Create your profile with your blood group and location so donors in need can find you.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Search',
    description: 'Find compatible donors in your city filtered by blood group and availability.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Save a Life',
    description: 'Connect with the recipient and donate at a nearby center. One donation saves up to 3 lives.',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">

        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="A father holds his child's hand in a hospital room while a doctor stands with a blood bag — symbolizing a life saved through blood donation"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-xl">

            <span className="inline-block bg-red-600/20 text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-red-600/30">
              🩸 Pakistan's Blood Donor Network
            </span>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Your Blood
              <span className="block text-red-500">Can Save</span>
              a Life
            </h1>

            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              Every 2 seconds someone needs blood. BloodCompass connects donors
              with patients across Pakistan — fast, free, and life-saving.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? '/find-donors' : '/signup'}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl text-center transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50"
              >
                {user ? 'Find Donors Now' : 'Become a Donor'}
              </Link>
              <Link
                to={user ? '/dashboard' : '/find-donors'}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-center transition-all duration-200 border border-white/20 backdrop-blur-sm"
              >
                {user ? 'Go to Dashboard' : 'Find Donors Now'}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="bg-red-600 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-red-100 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Three simple steps to make a life-saving difference in your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-red-600/50 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 border border-red-600/20">
                  {step.icon}
                </div>
                <div className="text-red-500 text-sm font-bold mb-2">STEP {index + 1}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            {user ? 'Welcome Back!' : "Ready to Be Someone's Hero?"}
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            {user
              ? 'Someone out there might need your blood today. Check the latest donors or update your profile.'
              : 'Join thousands of donors across Pakistan. Registration takes 2 minutes. Your blood takes 1 hour to donate. It gives someone a lifetime.'
            }
          </p>
          <Link
            to={user ? '/find-donors' : '/signup'}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30 inline-block"
          >
            {user ? 'Find Donors Now' : 'Register as a Donor'}
          </Link>
        </div>
      </section>

    </div>
  )
}