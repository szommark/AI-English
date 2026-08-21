import AuthPanel from './AuthPanel'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <AuthPanel />
      </div>
    </div>
  )
}
