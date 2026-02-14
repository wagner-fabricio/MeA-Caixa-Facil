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
    errorInfo?: React.ErrorInfo
}

/**
 * Error Boundary para capturar erros de componentes
 * Previne que a app toda quebre com um erro em um componente
 */
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
        this.setState({ errorInfo })

        // Aqui você poderia enviar para serviço de logging
        // logErrorService.report(error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900/20 p-4">
                    <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
                                Algo deu errado
                            </h2>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                            {this.state.error?.message || 'Um erro inesperado ocorreu'}
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="text-xs text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                                <summary className="cursor-pointer font-semibold mb-2">
                                    Detalhes técnicos
                                </summary>
                                <pre className="overflow-auto max-h-48 text-red-600 dark:text-red-400 font-mono text-xs">
                                    {this.state.error?.stack}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="overflow-auto max-h-48 text-gray-600 dark:text-gray-400 font-mono text-xs mt-2">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </details>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-semibold transition-colors"
                            >
                                Ir para Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
