import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY event when the recovery link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true)
      }
    })
    // Also check if already in a session (link already exchanged)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)

    // Check role and redirect appropriately after 2s
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') navigate('/admin')
        else if (profile?.role === 'worker') navigate('/worker/login')
        else navigate('/login')
      } else {
        navigate('/admin')
      }
    }, 2000)
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-sm">Verifying your reset link…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mb-4">
            <ShieldCheck size={26} className="text-stone-900" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">Set New Password</h1>
          <p className="text-stone-500 text-sm mt-1">Choose a secure password for your account</p>
        </div>

        {success ? (
          <div className="bg-green-950 border border-green-800 rounded-2xl p-5 text-center">
            <p className="text-green-400 font-semibold">Password updated!</p>
            <p className="text-green-600 text-sm mt-1">Redirecting you to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-stone-400 mb-1 block">New password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Min. 6 characters"
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

            <div>
              <label className="text-sm font-medium text-stone-400 mb-1 block">Confirm password</label>
              <input
                type="password"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950 border border-red-900 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="bg-yellow-400 text-stone-900 font-semibold py-3.5 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60 mt-2">
              {loading ? 'Saving…' : 'Set Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
