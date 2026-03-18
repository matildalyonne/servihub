import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AdminNav } from './Dashboard'
import { ArrowLeft, User, Lock, Bell, LogOut, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminSettings() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
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
    if (error) { setPwMsg(error.message) } else { setPwMsg('Password updated successfully!'); setNewPassword(''); setConfirmPassword('') }
    setPwLoading(false)
  }

  const menuItems = [
    { id: 'account', label: 'Account Info', icon: User, desc: 'View your admin profile' },
    { id: 'password', label: 'Change Password', icon: Lock, desc: 'Update your login password' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Manage notification preferences' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto pb-24 px-4 sm:px-6">
        <div className="pt-10 pb-5 flex items-center gap-3">
          <button onClick={() => section ? setSection(null) : navigate('/admin/dashboard')} className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display font-extrabold text-2xl text-stone-900">{section ? menuItems.find(m => m.id === section)?.label : 'Settings'}</h1>
        </div>

        {!section && (
          <>
            <div className="flex flex-col gap-2 mb-6">
              {menuItems.map(({ id, label, icon: Icon, desc }) => (
                <button key={id} onClick={() => setSection(id)}
                  className="bg-white rounded-2xl px-5 py-4 border border-stone-100 flex items-center gap-4 hover:border-stone-300 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800">{label}</p>
                    <p className="text-xs text-stone-400">{desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
              ))}
            </div>

            <button onClick={() => { signOut(); navigate('/admin') }}
              className="w-full bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-red-100 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <LogOut size={18} className="text-red-500" />
              </div>
              <span className="font-semibold text-red-600">Sign Out</span>
            </button>
          </>
        )}

        {section === 'account' && (
          <div className="bg-white rounded-2xl p-5 border border-stone-100">
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-stone-100">
              <div className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center text-yellow-400 font-display font-extrabold text-xl">
                {profile?.full_name?.[0] || 'A'}
              </div>
              <div>
                <p className="font-display font-bold text-stone-900 text-lg">{profile?.full_name || 'Admin'}</p>
                <p className="text-stone-500 text-sm">{profile?.email}</p>
                <span className="status-badge bg-stone-900 text-yellow-400 mt-1 inline-block">Admin</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm text-stone-600">
              <div className="flex justify-between"><span className="text-stone-400">Role</span><span className="font-semibold">Administrator</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Email</span><span className="font-semibold">{profile?.email}</span></div>
            </div>
          </div>
        )}

        {section === 'password' && (
          <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-4">
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
              <p className={`text-sm px-3 py-2 rounded-xl ${pwMsg.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                {pwMsg}
              </p>
            )}
            <button type="submit" disabled={pwLoading} className="btn-primary disabled:opacity-60">
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        {section === 'notifications' && (
          <div className="bg-white rounded-2xl p-5 border border-stone-100">
            <p className="text-stone-500 text-sm">Notification preferences coming soon.</p>
          </div>
        )}
      </div>
      <AdminNav />
    </div>
  )
}
