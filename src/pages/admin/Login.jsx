import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminLogin() {
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
    if (error) { setError('Invalid credentials.'); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied.')
      setLoading(false)
      return
    }
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mb-4">
            <Shield size={26} className="text-stone-900" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">ServiHub Admin</h1>
          <p className="text-stone-500 text-sm mt-1">Restricted access</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="admin@servihub.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-400 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-950 border border-red-900 px-3 py-2 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading} className="bg-yellow-400 text-stone-900 font-semibold py-3.5 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 mt-2">
            {loading ? 'Verifying…' : 'Access Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
