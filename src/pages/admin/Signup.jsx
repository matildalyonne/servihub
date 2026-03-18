import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminSignup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', secret: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Simple hardcoded secret passphrase — change this to whatever you want
    if (form.secret !== 'servihub-admin-2024') {
      setError('Incorrect secret passphrase.')
      return
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role: 'admin' } },
    })

    if (error) { setError(error.message); setLoading(false); return }

    if (data.user) {
      // Upsert profile with admin role (overrides trigger default of 'customer')
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.name,
        email: form.email,
        role: 'admin',
      })
      if (profileError) { setError(profileError.message); setLoading(false); return }
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mb-4">
            <ShieldCheck size={26} className="text-stone-900" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">Admin Setup</h1>
          <p className="text-stone-500 text-sm mt-1">Create an admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Full name</label>
            <input
              type="text"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="Your name"
              value={form.name}
              onChange={set('name')}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="admin@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Confirm password</label>
            <input
              type="password"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Secret passphrase</label>
            <input
              type="password"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="Enter the secret passphrase"
              value={form.secret}
              onChange={set('secret')}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-900 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="bg-yellow-400 text-stone-900 font-semibold py-3.5 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 mt-2">
            {loading ? 'Creating account…' : 'Create Admin Account'}
          </button>

          <button type="button" onClick={() => navigate('/admin')}
            className="text-stone-500 text-sm hover:text-stone-300 transition-colors text-center">
            Back to login
          </button>
        </form>
      </div>
    </div>
  )
}
