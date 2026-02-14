/**
 * API Fetch Utilities
 * Provides retry, timeout, and error handling for fetch calls
 */

export interface FetchOptions extends RequestInit {
    timeout?: number
    retries?: number
    retryDelay?: number
}

/**
 * Faz fetch com timeout automático
 * @param url - URL para fetch
 * @param options - Opções de fetch + timeout em ms
 * @returns Promise<Response>
 * @throws Error se timeout ou falha de rede
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
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Timeout após ${timeout}ms`)
        }
        throw error
    } finally {
        clearTimeout(timeoutId)
    }
}

/**
 * Faz fetch com retry automático em caso de falha
 * Usa exponential backoff para evitar sobrecarregar servidor
 * 
 * @param url - URL para fetch
 * @param options - Opções de fetch + retries + retryDelay
 * @returns Promise<Response>
 * @throws Error se falhar em todas tentativas
 */
export async function fetchWithRetry(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, {
                timeout: 5000,
                ...fetchOptions
            })

            // Sucesso ou erro que não é retentável
            if (response.ok || response.status === 404 || response.status === 401) {
                return response
            }

            // Se é última tentativa, retorna a resposta (mesmo que erro)
            if (attempt === retries) {
                return response
            }

            // Esperar com exponential backoff antes de retry
            await new Promise(resolve =>
                setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            )
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))

            // Se é última tentativa, throw
            if (attempt === retries) {
                throw lastError
            }

            // Esperar antes de retry
            await new Promise(resolve =>
                setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            )
        }
    }

    throw lastError || new Error(`Falha após ${retries} tentativas`)
}

/**
 * Faz fetch com timeout, retry E validação de resposta
 * Automaticamente trata erros HTTP e parsing JSON
 * 
 * @param url - URL para fetch
 * @param options - Opções de fetch
 * @param validator - Função de validação da resposta (ex: Zod parse)
 * @returns Promise<T> - Dados parseados e validados
 * @throws Error se houver erro de fetch, HTTP, JSON parse ou validação
 */
export async function apiCall<T>(
    url: string,
    options: FetchOptions = {},
    validator?: (data: any) => T
): Promise<T> {
    try {
        const response = await fetchWithRetry(url, {
            timeout: 5000,
            retries: 2,
            ...options
        })

        if (!response.ok) {
            let errorMessage = `Erro ${response.status}`
            try {
                const error = await response.json()
                errorMessage = error.message || error.error || errorMessage
            } catch {
                // Se não conseguir fazer parse do erro, usa statusText
                errorMessage = response.statusText || errorMessage
            }
            throw new Error(errorMessage)
        }

        let data: any

        try {
            data = await response.json()
        } catch (error) {
            throw new Error('Resposta inválida do servidor (JSON parse falhou)')
        }

        if (validator) {
            try {
                return validator(data)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Validação falhou'
                throw new Error(`Validação de resposta falhou: ${message}`)
            }
        }

        return data as T
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(String(error))
    }
}

/**
 * Helper para criar headers de requisição padrão
 */
export function createHeaders(additional?: Record<string, string>) {
    return {
        'Content-Type': 'application/json',
        ...additional
    }
}

/**
 * Helper para serializar parâmetros de query
 */
export function createQueryString(params: Record<string, any>): string {
    const filtered = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)

    return filtered.length > 0 ? '?' + filtered.join('&') : ''
}
