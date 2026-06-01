import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Store, ArrowRight, CheckCircle2, Phone, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/useAuthStore'
import { supabase } from '../lib/supabase.js'

export default function DealerRegisterPage() {
  const [form, setForm] = useState({ shop_name: '', shop_description: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { user, isDealer, isLoading, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Become a Dealer — ShopVerse'
    if (!isLoading && isDealer) navigate('/dealer')
  }, [isDealer, isLoading, navigate])

  useEffect(() => {
    if (!isLoading && !user) navigate('/login')
  }, [user, isLoading, navigate])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shop_name.trim()) {
      toast.error('Please enter your shop name.')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'dealer',
        shop_name: form.shop_name.trim(),
        shop_description: form.shop_description.trim(),
        phone: form.phone.trim(),
        is_approved: false,
      })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    await fetchProfile(user.id)
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-700 text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
            Your dealer application for <strong className="text-gray-800 dark:text-gray-200">{form.shop_name}</strong> has been submitted. The admin will review and approve your account within 24 hours.
          </p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all">
            Back to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25">
            <Store size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Become a Dealer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
            Register your shop on ShopVerse and start selling to thousands of customers.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { emoji: '📦', title: 'Manage Products', desc: 'Upload & manage your inventory' },
            { emoji: '🖼️', title: 'Upload Images', desc: 'Add real product photos' },
            { emoji: '📊', title: 'Track Sales', desc: 'Monitor your performance' },
          ].map((b) => (
            <div key={b.title} className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="text-2xl mb-2">{b.emoji}</div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{b.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Shop Information</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.shop_name}
                  onChange={set('shop_name')}
                  placeholder="e.g. Tech Galaxy Store"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Shop Description
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                <textarea
                  value={form.shop_description}
                  onChange={set('shop_description')}
                  placeholder="Tell customers what you sell..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><Store size={16} /> Submit Application <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
