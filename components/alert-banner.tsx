'use client'

import { AlertCircle, TrendingUp, TrendingDown, Info, X } from 'lucide-react'

interface Alert {
    id: string
    type: string
    message: string
    severity: 'info' | 'warning' | 'critical'
    isRead: boolean
}

interface AlertBannerProps {
    alerts: Alert[]
    onDismiss: (id: string) => void
}

export default function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
    if (alerts.length === 0) return null

    const unreadAlerts = alerts.filter(a => !a.isRead)
    if (unreadAlerts.length === 0) return null

    return (
        <div className="space-y-3 mb-6">
            {unreadAlerts.map(alert => {
                const severityStyles = {
                    info: 'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300',
                    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-800 dark:text-yellow-300',
                    critical: 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300',
                }

                const Icon = {
                    info: Info,
                    warning: AlertCircle,
                    critical: AlertCircle,
                }[alert.severity as keyof typeof severityStyles]

                return (
                    <div
                        key={alert.id}
                        className={`flex items-start gap-4 p-5 rounded-2xl border backdrop-blur-md shadow-lg transition-all hover:scale-[1.01] ${severityStyles[alert.severity as keyof typeof severityStyles]}`}
                    >
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <p className="flex-1 text-sm font-bold leading-relaxed">{alert.message}</p>
                        <button
                            onClick={() => onDismiss(alert.id)}
                            className="bg-black/5 hover:bg-black/10 p-2 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
