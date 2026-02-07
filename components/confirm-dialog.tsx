'use client'

interface ConfirmDialogProps {
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({ open, title = 'Confirmar', message = '', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-[min(92%,420px)]">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">{cancelLabel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 text-white">{confirmLabel}</button>
                </div>
            </div>
        </div>
    )
}
