'use client'

import SidebarNav from '@/components/sidebar-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { AppProvider } from '@/lib/context/app-context'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ErrorBoundary>
            <AppProvider>
                <div className="flex flex-col md:flex-row min-h-screen bg-background">
                    <SidebarNav />
                    <div className="flex-1 overflow-auto flex flex-col pt-16 md:pt-0 w-full">
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </div>
            </AppProvider>
        </ErrorBoundary>
    )
}
