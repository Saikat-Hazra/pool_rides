import { useUIStore } from '@/store/uiStore'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
  info: <Info className="w-4 h-4 text-teal-500" />,
}

const BG = {
  success: 'bg-slate-900 border-green-900/30 shadow-green-900/10',
  error: 'bg-slate-900 border-red-900/30 shadow-red-900/10',
  info: 'bg-slate-900 border-teal-900/30 shadow-teal-900/10',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-md animate-slide-up pointer-events-auto ${BG[toast.type]}`}
        >

          {ICONS[toast.type]}
          <span className="text-sm text-white flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
