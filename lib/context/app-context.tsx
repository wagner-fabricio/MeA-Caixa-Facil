'use client'

/**
 * App Context
 * Compartilha user e business data para toda a aplicação
 * Evita múltiplas chamadas de API para dados iguais
 */

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'
import { createClient } from '@/utils/supabase/client'
import type { User, Business } from '@/types'

interface AppContextType {
    user: User | null
    business: Business | null
    loading: boolean
    error?: Error
    refetch: () => Promise<void>
    isAuthenticated: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | undefined>()

    const supabase = createClient()

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(undefined)

        try {
            // Get authenticated user
            const { data: { user: currentUser } } = await supabase.auth.getUser()

            if (!currentUser) {
                setUser(null)
                setBusiness(null)
                setLoading(false)
                return
            }

            setUser(currentUser as User)

            // Get user's businesses
            try {
                const businesses = await apiClient.getBusinesses()
                if (businesses.length > 0) {
                    setBusiness(businesses[0])
                } else {
                    setBusiness(null)
                }
            } catch (err) {
                console.error('Error loading businesses:', err)
                setBusiness(null)
            }
        } catch (err) {
            const appError = err instanceof Error ? err : new Error(String(err))
            setError(appError)
            console.error('Error in AppProvider:', appError)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    // Load user and business on mount
    useEffect(() => {
        refetch()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'USER_DELETED') => {
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setBusiness(null)
            } else if (event === 'SIGNED_IN') {
                await refetch()
            }
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [refetch, supabase])

    const value: AppContextType = {
        user,
        business,
        loading,
        error,
        refetch,
        isAuthenticated: !!user
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

/**
 * Hook para usar App Context
 * @throws Error se usado fora de AppProvider
 */
export function useAppContext() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext deve ser usado dentro de AppProvider')
    }
    return context
}

/**
 * Hook para pegar apenas user
 */
export function useUser() {
    const { user } = useAppContext()
    return user
}

/**
 * Hook para pegar apenas business
 */
export function useBusiness() {
    const { business } = useAppContext()
    return business
}

/**
 * Hook para pegar apenas loading state
 */
export function useAppLoading() {
    const { loading } = useAppContext()
    return loading
}

/**
 * Hook para pegar apenas autenticação
 */
export function useIsAuthenticated() {
    const { isAuthenticated } = useAppContext()
    return isAuthenticated
}
