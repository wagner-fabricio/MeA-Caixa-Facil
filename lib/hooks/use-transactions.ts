/**
 * useTransactions Hook
 * Hook para carregar e gerenciar transações com loading/error states
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/logger'
import type { Transaction, PeriodFilter } from '@/types'

interface UseTransactionsOptions {
    businessId?: string
    startDate?: string
    endDate?: string
    autoload?: boolean
}

interface UseTransactionsResult {
    transactions: Transaction[]
    isLoading: boolean
    error?: Error
    refetch: () => Promise<void>
    isEmpty: boolean
    total: number
}

/**
 * Hook para carregar transações com retry automático
 *
 * @param options - Opções de carregamento
 * @returns Estado das transações + métodos
 *
 * @example
 * const { transactions, isLoading, refetch } = useTransactions({
 *     businessId: 'xyz123',
 *     startDate: '2024-01-01',
 *     autoload: true
 * })
 */
export function useTransactions(options: UseTransactionsOptions): UseTransactionsResult {
    const { businessId, startDate, endDate, autoload = true } = options

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | undefined>()

    const refetch = useCallback(async () => {
        if (!businessId) {
            logger.warn('useTransactions: businessId not provided')
            return
        }

        setIsLoading(true)
        setError(undefined)

        try {
            const childLogger = logger.createChild({
                businessId,
                startDate,
                endDate
            })

            childLogger.info('Carregando transações')

            const data = await apiClient.getTransactions(businessId, startDate, endDate)

            setTransactions(data)
            childLogger.info('Transações carregadas com sucesso', { count: data.length })
        } catch (err) {
            const appError = err instanceof Error ? err : new Error(String(err))
            setError(appError)
            logger.error('Erro ao carregar transações', appError, { businessId })
        } finally {
            setIsLoading(false)
        }
    }, [businessId, startDate, endDate])

    // Auto-load on mount or when dependencies change
    useEffect(() => {
        if (autoload && businessId) {
            refetch()
        }
    }, [businessId, startDate, endDate, autoload, refetch])

    return {
        transactions,
        isLoading,
        error,
        refetch,
        isEmpty: !isLoading && transactions.length === 0,
        total: transactions.length
    }
}

/**
 * Hook para deletar uma transação
 */
export function useDeleteTransaction() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | undefined>()

    const deleteTransaction = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(undefined)

        try {
            await apiClient.deleteTransaction(id)
            logger.info('Transção deletada', { id })
            return true
        } catch (err) {
            const appError = err instanceof Error ? err : new Error(String(err))
            setError(appError)
            logger.error('Erro ao deletar transação', appError, { id })
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { deleteTransaction, isLoading, error }
}

/**
 * Hook para atualizar uma transação
 */
export function useUpdateTransaction() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | undefined>()

    const updateTransaction = useCallback(
        async (id: string, data: Partial<Omit<Transaction, 'id' | 'businessId'>>) => {
            setIsLoading(true)
            setError(undefined)

            try {
                const result = await apiClient.updateTransaction(id, data)
                logger.info('Transação atualizada', { id })
                return result
            } catch (err) {
                const appError = err instanceof Error ? err : new Error(String(err))
                setError(appError)
                logger.error('Erro ao atualizar transação', appError, { id })
                throw appError
            } finally {
                setIsLoading(false)
            }
        },
        []
    )

    return { updateTransaction, isLoading, error }
}
