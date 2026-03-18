import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function WorkerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'worker') {
      await supabase.auth.signOut()
      setError('This account is not a worker account. Please use the customer login.')
      setLoading(false)
      return
    }
    navigate('/worker/dashboard')
  }

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen px-6 py-10">
        <button onClick={() => navigate('/')} className="self-start text-stone-500 hover:text-stone-700 mb-8">
          <ArrowLeft size={22} />
        </button>

        {/* Brand accent */}
        <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center mb-6">
          <span className="text-yellow-400 font-display font-extrabold text-lg">S</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-extrabold text-stone-900">Worker Login</h1>
          <p className="text-stone-500 mt-1">Access your ServiHub worker account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="worker@servihub.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-11"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-stone-100 rounded-2xl">
          <p className="text-xs text-stone-500 text-center leading-relaxed">
            Don't have an account? Worker accounts are created by the ServiHub admin.
            Contact your manager to get access.
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
