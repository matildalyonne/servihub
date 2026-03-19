import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import MobileShell from '../../components/layout/MobileShell'
import WorkerNav from '../../components/layout/WorkerNav'
import { ArrowLeft, User, Lock, LogOut, ChevronRight, Save, Plus, X } from 'lucide-react'

const AVAILABLE_SKILLS = [
  'Cleaning', 'Laundry', 'Car Washing', 'Slashing', 'Cooking',
  'Plumbing', 'Electrical', 'AC Repair', 'Interior Repairs', 'Painting',
  'Gardening', 'Security', 'Childcare', 'Elderly Care',
]

export default function WorkerProfile() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState(null)
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // About form state
  const [bio, setBio] = useState('')
  const [title, setTitle] = useState('')
  const [skills, setSkills] = useState([])

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    if (!profile) return
    fetchWorkerData()
  }, [profile])

  async function fetchWorkerData() {
    const { data } = await supabase
      .from('workers')
      .select('*')
      .eq('id', profile.id)
      .single()
    setWorker(data)
    setBio(data?.bio || '')
    setTitle(data?.title || '')
    setSkills(data?.skills || [])
    setLoading(false)
  }

  async function saveAbout(e) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('workers')
      .update({ bio, title, skills })
      .eq('id', profile.id)
    if (error) {
      setSaveMsg('Error saving: ' + error.message)
    } else {
      setSaveMsg('Saved successfully!')
      setWorker(w => ({ ...w, bio, title, skills }))
      setTimeout(() => { setSaveMsg(''); setSection(null) }, 1500)
    }
    setSaving(false)
  }

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
      setTimeout(() => { setPwMsg(''); setSection(null) }, 1500)
    }
    setPwLoading(false)
  }

  function toggleSkill(skill) {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const menuItems = [
    { id: 'about', label: 'About & Services', icon: User, desc: 'Edit your bio and skills' },
    { id: 'password', label: 'Change Password', icon: Lock, desc: 'Update your login password' },
  ]

  return (
    <MobileShell>
      <div className="flex flex-col min-h-screen pb-24">
        <div className="px-5 pt-10 pb-4 flex items-center gap-3">
          {section && (
            <button onClick={() => { setSection(null); setSaveMsg(''); setPwMsg('') }}
              className="text-stone-500 hover:text-stone-700">
              <ArrowLeft size={22} />
            </button>
          )}
          <h1 className="font-display font-extrabold text-2xl text-stone-900">
            {section === 'about' ? 'About & Services' : section === 'password' ? 'Change Password' : 'My Profile'}
          </h1>
        </div>

        {!section && (
          <>
            {/* Avatar & summary */}
            <div className="px-5 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center text-yellow-400 font-display font-extrabold text-2xl flex-shrink-0">
                {profile?.full_name?.[0] || 'W'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-extrabold text-xl text-stone-900">{profile?.full_name}</p>
                <p className="text-stone-500 text-sm truncate">{worker?.title || 'Service Professional'}</p>
                <span className="status-badge bg-yellow-100 text-yellow-700 mt-1 inline-block">Worker</span>
              </div>
            </div>

            {/* Stats row */}
            {!loading && worker && (
              <div className="px-5 mb-6">
                <div className="card flex justify-around">
                  <div className="text-center">
                    <p className="font-display font-extrabold text-xl text-stone-900">{worker.rating?.toFixed(1) || '5.0'}</p>
                    <p className="text-xs text-stone-400">Rating</p>
                  </div>
                  <div className="w-px bg-stone-100" />
                  <div className="text-center">
                    <p className="font-display font-extrabold text-xl text-stone-900">{worker.review_count || 0}</p>
                    <p className="text-xs text-stone-400">Reviews</p>
                  </div>
                  <div className="w-px bg-stone-100" />
                  <div className="text-center">
                    <p className="font-display font-extrabold text-xl text-stone-900">{worker.years_exp || 0}</p>
                    <p className="text-xs text-stone-400">Yrs Exp</p>
                  </div>
                </div>
              </div>
            )}

            {/* Skills preview */}
            {worker?.skills?.length > 0 && (
              <div className="px-5 mb-6">
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-semibold text-stone-700">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Menu */}
            <div className="px-5 flex flex-col gap-2 mb-6">
              {menuItems.map(({ id, label, icon: Icon, desc }) => (
                <button key={id} onClick={() => setSection(id)}
                  className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left">
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

            {/* Sign out */}
            <div className="px-5">
              <button onClick={() => { signOut(); navigate('/worker/login') }}
                className="w-full bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-red-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <span className="font-semibold text-red-600">Sign Out</span>
              </button>
            </div>
          </>
        )}

        {/* About & Services section */}
        {section === 'about' && (
          <form onSubmit={saveAbout} className="px-5 flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-1 block">Job Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Senior Cleaner, Plumber"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-700 mb-1 block">About You</label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Describe your experience, approach, and what makes you great at your job…"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 block">Services Offered</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SKILLS.map(skill => {
                  const selected = skills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        selected
                          ? 'bg-yellow-400 border-yellow-400 text-stone-900'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {selected && <X size={11} />}
                      {skill}
                    </button>
                  )
                })}
              </div>
              {skills.length > 0 && (
                <p className="text-xs text-stone-400 mt-2">{skills.length} service{skills.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>

            {saveMsg && (
              <p className={`text-sm px-3 py-2 rounded-xl ${saveMsg.includes('Error') ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                {saveMsg}
              </p>
            )}

            <button type="submit" disabled={saving}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Password section */}
        {section === 'password' && (
          <form onSubmit={handleChangePassword} className="px-5 flex flex-col gap-4">
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
        )}
      </div>
      <WorkerNav />
    </MobileShell>
  )
}
