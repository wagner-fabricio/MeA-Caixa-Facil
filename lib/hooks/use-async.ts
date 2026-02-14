/**
 * useAsync Hook
 * Hook para gerenciar operações assincronas com loading e error states
 */

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
 * @param asyncFunction - Função async para executar (pode receber argumentos opcionais)
 * @param immediate - Se deve executar automaticamente ao montar (sem argumentos)
 * @returns Estado atual + função execute para executar manualmente
 *
 * @example
 * const { data, isLoading, error, execute } = useAsync(
 *     async () => fetch('/api/data').then(r => r.json()),
 *     true // rodar ao montar
 * )
 */
export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate = true
) {
    const [state, setState] = useState<UseAsyncState<T>>({
        status: 'idle',
        data: undefined,
        error: undefined,
        isLoading: false
    })

    const execute = useCallback(
        async () => {
            setState({ status: 'pending', data: undefined, error: undefined, isLoading: true })
            try {
                const response = await asyncFunction()
                setState({
                    status: 'success',
                    data: response,
                    error: undefined,
                    isLoading: false
                })
                return response
            } catch (error) {
                const appError = error instanceof Error ? error : new Error(String(error))
                setState({
                    status: 'error',
                    data: undefined,
                    error: appError,
                    isLoading: false
                })
                throw appError
            }
        },
        [asyncFunction]
    )

    useEffect(() => {
        if (immediate) {
            execute()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate])

    return { ...state, execute }
}
