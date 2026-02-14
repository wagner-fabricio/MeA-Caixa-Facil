/**
 * Structured Logger
 * Provides consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: Record<string, any>
    error?: {
        message: string
        stack?: string
    }
}

/**
 * Structured logger for the application
 * Logs to console in development, can be extended to send to logging service
 */
class Logger {
    private isDev = process.env.NODE_ENV === 'development'
    private isTest = process.env.NODE_ENV === 'test'

    /**
     * Format log entry as JSON
     */
    private format(entry: LogEntry): string {
        return JSON.stringify(entry)
    }

    /**
     * Internal log method
     */
    private log(
        level: LogLevel,
        message: string,
        context?: Record<string, any>,
        error?: Error
    ) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(context && { context }),
            ...(error && {
                error: {
                    message: error.message,
                    stack: error.stack
                }
            })
        }

        const formatted = this.format(entry)

        // Log to console in development
        if (this.isDev && !this.isTest) {
            const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
            console[consoleMethod](formatted)
        }

        // Send to logging service for errors in production
        if (level === 'error' && !this.isDev) {
            this.sendToLoggingService(entry)
        }
    }

    /**
     * Send critical logs to external service (Sentry, LogRocket, etc.)
     * Implementar conforme necessário
     */
    private sendToLoggingService(entry: LogEntry) {
        // Exemplo: Sentry.captureMessage(entry.message)
        // Por enquanto, apenas log
        if (typeof window !== 'undefined' && !this.isTest) {
            // Could send to external service here
        }
    }

    /**
     * Debug level log
     */
    debug(message: string, context?: Record<string, any>) {
        this.log('debug', message, context)
    }

    /**
     * Info level log
     */
    info(message: string, context?: Record<string, any>) {
        this.log('info', message, context)
    }

    /**
     * Warn level log
     */
    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context)
    }

    /**
     * Error level log
     */
    error(message: string, error?: Error | string, context?: Record<string, any>) {
        const err = error instanceof Error ? error : error ? new Error(error) : undefined
        this.log('error', message, context, err)
    }

    /**
     * Group related logs
     */
    group(label: string) {
        if (this.isDev && !this.isTest) {
            console.group(label)
        }
    }

    /**
     * End log group
     */
    groupEnd() {
        if (this.isDev && !this.isTest) {
            console.groupEnd()
        }
    }

    /**
     * Create a child logger with automatic context
     */
    createChild(context: Record<string, any>) {
        return {
            debug: (message: string, ctx?: Record<string, any>) =>
                this.debug(message, { ...context, ...ctx }),
            info: (message: string, ctx?: Record<string, any>) =>
                this.info(message, { ...context, ...ctx }),
            warn: (message: string, ctx?: Record<string, any>) =>
                this.warn(message, { ...context, ...ctx }),
            error: (message: string, error?: Error | string, ctx?: Record<string, any>) =>
                this.error(message, error, { ...context, ...ctx })
        }
    }
}

// Export singleton instance
export const logger = new Logger()

/**
 * Performance logging helper
 */
export function logPerformance(label: string) {
    return {
        start: () => {
            const startTime = performance.now()
            return {
                end: () => {
                    const duration = performance.now() - startTime
                    logger.info(`${label} took ${duration.toFixed(2)}ms`)
                    return duration
                }
            }
        }
    }
}
