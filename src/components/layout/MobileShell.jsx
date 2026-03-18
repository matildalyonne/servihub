export default function MobileShell({ children }) {
  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      <div className="w-full max-w-lg bg-stone-50 min-h-screen relative">
        {children}
      </div>
    </div>
  )
}
