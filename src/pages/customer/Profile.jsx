import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import CustomerNav from '../../components/layout/CustomerNav'
import { User, Lock, LogOut, ChevronRight, ArrowLeft } from 'lucide-react'

export default function CustomerProfile() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwMsg('')
    if (newPassword !== confirmPassword) { setPwMsg('Passwords do not match.'); return }
    if (newPassword.length < 6) { setPwMsg('Password must be at least 6 characters.'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwMsg(error.message) } else {
      setPwMsg('Password updated!')
      setNewPassword(''); setConfirmPassword('')
    }
    setPwLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        <div className="px-5 pt-10 pb-4 flex items-center gap-3">
          {section && (
            <button onClick={() => setSection(null)} className="text-stone-500 hover:text-stone-700">
              <ArrowLeft size={22} />
            </button>
          )}
          <h1 className="font-display font-extrabold text-2xl text-stone-900">
            {section === 'password' ? 'Change Password' : 'Profile'}
          </h1>
        </div>

        {!section && (
          <>
            {/* Avatar & name */}
            <div className="px-5 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-stone-900 font-display font-extrabold text-2xl flex-shrink-0">
                {profile?.full_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-display font-extrabold text-xl text-stone-900">{profile?.full_name}</p>
                <p className="text-stone-500 text-sm">{profile?.email}</p>
                <span className="status-badge bg-yellow-100 text-yellow-700 mt-1 inline-block">Customer</span>
              </div>
            </div>

            {/* Menu items */}
            <div className="px-5 flex flex-col gap-2 mb-6">
              <button onClick={() => setSection('password')}
                className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Lock size={18} className="text-stone-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-stone-800">Change Password</p>
                  <p className="text-xs text-stone-400">Update your login password</p>
                </div>
                <ChevronRight size={18} className="text-stone-400" />
              </button>
            </div>

            {/* Sign out */}
            <div className="px-5">
              <button onClick={() => { signOut(); navigate('/') }}
                className="w-full bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-red-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <span className="font-semibold text-red-600">Sign Out</span>
              </button>
            </div>
          </>
        )}

        {section === 'password' && (
          <div className="px-5">
            <form onSubmit={handleChangePassword} className="card flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">New Password</label>
                <input type="password" className="input-field" placeholder="Min. 6 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Confirm Password</label>
                <input type="password" className="input-field" placeholder="Re-enter new password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              {pwMsg && (
                <p className={`text-sm px-3 py-2 rounded-xl ${pwMsg.includes('updated') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                  {pwMsg}
                </p>
              )}
              <button type="submit" disabled={pwLoading} className="btn-primary disabled:opacity-60">
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
      <CustomerNav />
    </MobileShell>
  )
}
