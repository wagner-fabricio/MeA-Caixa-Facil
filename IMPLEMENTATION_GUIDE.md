# Soluções Prontas - Implementação Rápida

Arquivo com código pronto para copiar e colar para resolver os problemas identificados.

---

## 1. Definições de Tipos para Remover `any`

**Arquivo**: `types/index.ts` (criar)

```typescript
// User
export interface User {
    id: string
    email: string
    created_at: string
    user_metadata?: {
        name?: string
        avatar_url?: string
    }
}

export interface Business {
    id: string
    ownerId: string
    name: string
    type: 'barbershop' | 'salon' | 'workshop' | 'retail' | 'other'
    createdAt: string
    updatedAt: string
}

// Transaction
export interface Transaction {
    id: string
    businessId: string
    type: 'income' | 'expense'
    amount: number
    description: string
    category: string
    method: 'manual' | 'voice'
    date: string
    createdAt: string
    deletedAt?: string | null
}

// Category
export interface Category {
    id: string
    businessId: string
    name: string
    type: 'income' | 'expense'
    color?: string
    usageCount: number
    isDefault: boolean
    createdAt: string
}

// Account
export interface Account {
    id: string
    businessId: string
    name: string
    type: 'bank' | 'card' | 'wallet' | 'cash'
    balance: number
    createdAt: string
}

// Alert
export interface Alert {
    id: string
    businessId: string
    type: string
    message: string
    severity: 'info' | 'warning' | 'critical'
    isRead: boolean
    createdAt: string
}

// API Responses
export interface ApiResponse<T> {
    data?: T
    error?: string
    success: boolean
}
```

---

## 2. Error Boundary Component

**Arquivo**: `components/error-boundary.tsx` (criar)

```typescript
'use client'

import React, { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        
        // Aqui você poderia enviar para serviço de logging
        // logErrorService.report(error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-96 p-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            <h2 className="text-lg font-bold text-red-800 dark:text-red-200">
                                Algo deu errado
                            </h2>
                        </div>
                        
                        <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                            {this.state.error?.message || 'Um erro inesperado ocorreu'}
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="text-xs text-red-600 dark:text-red-400 mb-4">
                                <summary>Detalhes técnicos</summary>
                                <pre className="mt-2 bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-auto">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
```

Usar em `app/(app)/layout.tsx`:

```tsx
import { ErrorBoundary } from '@/components/error-boundary'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <SidebarNav />
            <main>{children}</main>
        </ErrorBoundary>
    )
}
```

---

## 3. API Fetch com Timeout e Retry

**Arquivo**: `lib/api/fetch-utils.ts` (criar)

```typescript
export interface FetchOptions extends RequestInit {
    timeout?: number
    retries?: number
    retryDelay?: number
}

/**
 * Faz fetch com timeout
 */
export async function fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { timeout = 5000, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        return await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        })
    } finally {
        clearTimeout(timeoutId)
    }
}

/**
 * Faz fetch com retry automático
 */
export async function fetchWithRetry(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, fetchOptions)

            // Sucesso ou erro que não é retentável
            if (response.ok || response.status === 404 || response.status === 401) {
                return response
            }

            // Se é última tentativa, throw
            if (attempt === retries) {
                return response
            }

            // Esperar antes de retry
            await new Promise(resolve => 
                setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            )
        } catch (error) {
            // Se é última tentativa, throw
            if (attempt === retries) throw error

            // Esperar antes de retry
            await new Promise(resolve => 
                setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            )
        }
    }

    throw new Error(`Falha após ${retries} tentativas`)
}

/**
 * Faz fetch com timeout, retry E validação de resposta
 */
export async function apiCall<T>(
    url: string,
    options: FetchOptions = {},
    validator?: (data: any) => T
): Promise<T> {
    const response = await fetchWithRetry(url, {
        timeout: 5000,
        retries: 2,
        ...options
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
        throw new Error(error.message || `Erro ${response.status}`)
    }

    const data = await response.json()

    if (validator) {
        return validator(data)
    }

    return data as T
}
```

---

## 4. API Client Centralizado

**Arquivo**: `lib/api/client.ts` (criar)

```typescript
import { z } from 'zod'
import { apiCall } from './fetch-utils'
import type { Transaction, Category, Account, Business } from '@/types'

// Schemas de validação
const TransactionsResponseSchema = z.object({
    transactions: z.array(z.object({
        id: z.string(),
        type: z.enum(['income', 'expense']),
        amount: z.number(),
        description: z.string(),
        category: z.string(),
        date: z.string(),
        method: z.string().default('manual')
    }))
})

const CategoriesResponseSchema = z.object({
    categories: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['income', 'expense']),
        usageCount: z.number().default(0)
    }))
})

const BusinessesResponseSchema = z.object({
    businesses: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.string()
    }))
})

// Client API
export const apiClient = {
    // Transações
    async getTransactions(
        businessId: string,
        startDate?: string,
        endDate?: string
    ): Promise<Transaction[]> {
        const params = new URLSearchParams({
            businessId,
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        })

        const data = await apiCall(
            `/api/transactions?${params}`,
            {},
            (raw) => TransactionsResponseSchema.parse(raw).transactions
        )

        return data
    },

    async createTransaction(payload: {
        input: string
        businessId: string
        method?: 'manual' | 'voice'
    }): Promise<Transaction> {
        const response = await apiCall(
            '/api/transactions',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        )
        return response.transaction
    },

    async updateTransaction(
        id: string,
        payload: Partial<Omit<Transaction, 'id' | 'businessId'>>
    ): Promise<Transaction> {
        const response = await apiCall(
            '/api/transactions',
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...payload })
            }
        )
        return response.transaction
    },

    async deleteTransaction(id: string): Promise<void> {
        await apiCall('/api/transactions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
    },

    async restoreTransaction(payload: any): Promise<Transaction> {
        const response = await apiCall(
            '/api/transactions/restore',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        )
        return response.transaction
    },

    // Categorias
    async getCategories(businessId: string): Promise<Category[]> {
        const data = await apiCall(
            `/api/categories?businessId=${businessId}`,
            {},
            (raw) => CategoriesResponseSchema.parse(raw).categories
        )
        return data
    },

    // Negócios
    async getBusinesses(): Promise<Business[]> {
        const data = await apiCall(
            '/api/businesses',
            {},
            (raw) => BusinessesResponseSchema.parse(raw).businesses
        )
        return data
    },

    // Alertas
    async getAlerts(businessId: string) {
        return apiCall(`/api/alerts?businessId=${businessId}`)
    },

    async generateAlerts(businessId: string) {
        return apiCall(
            '/api/alerts',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId })
            }
        )
    }
}
```

---

## 5. Custom Hook para Loading e Erro

**Arquivo**: `lib/hooks/use-async.ts` (criar)

```typescript
import { useState, useCallback, useEffect } from 'react'

interface UseAsyncState<T> {
    status: 'idle' | 'pending' | 'success' | 'error'
    data?: T
    error?: Error
    isLoading: boolean
}

/**
 * Hook para gerenciar operações assíncronas
 * 
 * @example
 * const { data, isLoading, error, execute } = useAsync(myAsyncFunction)
 */
export function useAsync<T, A extends any[]>(
    asyncFunction: (...args: A) => Promise<T>,
    immediate = true
) {
    const [state, setState] = useState<UseAsyncState<T>>({
        status: 'idle',
        data: undefined,
        error: undefined,
        isLoading: false
    })

    const execute = useCallback(
        async (...args: A) => {
            setState({ status: 'pending', data: undefined, error: undefined, isLoading: true })
            try {
                const response = await asyncFunction(...args)
                setState({
                    status: 'success',
                    data: response,
                    error: undefined,
                    isLoading: false
                })
                return response
            } catch (error) {
                setState({
                    status: 'error',
                    data: undefined,
                    error: error instanceof Error ? error : new Error(String(error)),
                    isLoading: false
                })
                throw error
            }
        },
        [asyncFunction]
    )

    useEffect(() => {
        if (immediate) {
            execute()
        }
    }, [execute, immediate])

    return { ...state, execute }
}
```

---

## 6. Context para Dados Compartilhados

**Arquivo**: `lib/context/app-context.tsx` (criar)

```typescript
'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { createClient } from '@/utils/supabase/client'
import type { User, Business } from '@/types'

interface AppContextType {
    user: User | null
    business: Business | null
    loading: boolean
    error?: Error
    refetch: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | undefined>()

    const supabase = createClient()

    const refetch = async () => {
        setLoading(true)
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            setUser(currentUser as User | null)

            if (currentUser) {
                const businesses = await apiClient.getBusinesses()
                if (businesses.length > 0) {
                    setBusiness(businesses[0])
                }
            }
            setError(undefined)
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refetch()
    }, [])

    return (
        <AppContext.Provider value={{ user, business, loading, error, refetch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext deve ser usado dentro de AppProvider')
    }
    return context
}
```

Usar em `app/(app)/layout.tsx`:

```tsx
import { AppProvider } from '@/lib/context/app-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <SidebarNav />
            <main>{children}</main>
        </AppProvider>
    )
}
```

---

## 7. Hook com SWR (Cache)

**Arquivo**: `lib/hooks/use-transactions.ts` (criar)

```typescript
import useSWR from 'swr'
import { apiClient } from '@/lib/api/client'
import type { Transaction } from '@/types'

interface UseTransactionsOptions {
    businessId: string
    startDate?: string
    endDate?: string
}

export function useTransactions({
    businessId,
    startDate,
    endDate
}: UseTransactionsOptions) {
    const queryKey = [
        '/api/transactions',
        businessId,
        startDate,
        endDate
    ].filter(Boolean).join('|')

    const { data, error, isLoading, mutate } = useSWR(
        businessId ? queryKey : null,
        () => apiClient.getTransactions(businessId, startDate, endDate),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 60000, // Cache por 1 minuto
            focusThrottleInterval: 300000 // Revalidate a cada 5min se estiver em foco
        }
    )

    return {
        transactions: (data || []) as Transaction[],
        isLoading,
        error,
        mutate,
        isEmpty: !isLoading && (!data || data.length === 0)
    }
}
```

---

## 8. Validação com Zod melhorada

**Arquivo**: `lib/validation/schemas.ts` (criar)

```typescript
import { z } from 'zod'

// Transação
export const TransactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z
        .number()
        .positive('Valor deve ser maior que zero')
        .finite('Valor deve ser um número válido'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    date: z.string().datetime().optional()
})

// Entrada de Transação
export const CreateTransactionInputSchema = z.object({
    input: z
        .string()
        .min(1, 'entrada não pode estar vazia')
        .max(500, 'Entrada muito longa'),
    businessId: z.string().uuid('ID de negócio inválido'),
    method: z.enum(['manual', 'voice']).optional()
})

// Negócio
export const BusinessSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Nome obrigatório'),
    type: z.enum(['barbershop', 'salon', 'workshop', 'retail', 'other']),
    ownerId: z.string().uuid()
})

// Categoria
export const CategorySchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    type: z.enum(['income', 'expense']),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
})
```

---

## 9. Logger Estruturado (simples)

**Arquivo**: `lib/logger.ts` (criar)

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: Record<string, any>
    error?: Error
}

class Logger {
    private isDev = process.env.NODE_ENV === 'development'

    private format(entry: LogEntry): string {
        return JSON.stringify(entry)
    }

    private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(context && { context }),
            ...(error && { error: { message: error.message, stack: error.stack } })
        }

        const formatted = this.format(entry)

        // Log para console em desenv
        if (this.isDev) {
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](formatted)
        }

        // Aqui você poderia enviar para um serviço: Sentry, LogRocket, etc.
        if (level === 'error') {
            // sendToErrorTracking(entry)
        }
    }

    debug(message: string, context?: Record<string, any>) {
        this.log('debug', message, context)
    }

    info(message: string, context?: Record<string, any>) {
        this.log('info', message, context)
    }

    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context)
    }

    error(message: string, error?: Error, context?: Record<string, any>) {
        this.log('error', message, context, error)
    }
}

export const logger = new Logger()
```

---

## Como Migrar Seu Código

### Passo 1: Criar novos arquivos
Crie todos os arquivos listados acima nas pastas indicadas.

### Passo 2: Atualizar dashboard/page.tsx
```typescript
// Remover isso:
const [user, setUser] = useState<any>(null)
const [categories, setCategories] = useState<any[]>([])

// Usar isso:
import { useAppContext } from '@/lib/context/app-context'
import { useTransactions } from '@/lib/hooks/use-transactions'

const { user, business } = useAppContext()
const { transactions, isLoading } = useTransactions({ businessId })
```

### Passo 3: Instalar dependências
```bash
npm install swr zod
```

### Passo 4: Testar incrementalmente
Aplique mudanças em um componente por vez e teste.

---

**Nota**: Comece pelos arquivos mais críticos (tipos, error boundary, api client).
