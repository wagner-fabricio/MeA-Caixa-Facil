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
                    info: 'bg-blue-50 border-blue-200 text-blue-800',
                    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    critical: 'bg-red-50 border-red-200 text-red-800',
                }

                const Icon = {
                    info: Info,
                    warning: AlertCircle,
                    critical: AlertCircle,
                }[alert.severity]

                return (
                    <div
                        key={alert.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 ${severityStyles[alert.severity]}`}
                    >
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p className="flex-1 text-sm font-medium">{alert.message}</p>
                        <button
                            onClick={() => onDismiss(alert.id)}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
