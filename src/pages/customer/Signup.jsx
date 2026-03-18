import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function CustomerSignup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role: 'customer' } },
    })

    if (error) { setError(error.message); setLoading(false); return }

    navigate('/home')
  }

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen px-6 py-10">
        <button onClick={() => navigate('/')} className="self-start text-stone-500 hover:text-stone-700 mb-8">
          <ArrowLeft size={22} />
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-extrabold text-stone-900">Create account</h1>
          <p className="text-stone-500 mt-1">Join ServiHub as a customer</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Full name</label>
            <input type="text" className="input-field" placeholder="Gloria Nakato" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-field pr-11" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Confirm password</label>
            <input type="password" className="input-field" placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} required />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-stone-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </MobileShell>
  )
}
