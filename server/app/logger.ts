type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
}

function getCurrentLogLevel(): LogLevel {
    const value = process.env.LOG_LEVEL as LogLevel | undefined

    if (!value || !(value in LOG_LEVELS)) {
        return 'info'
    }

    return value
}

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[getCurrentLogLevel()]
}

function formatMessage(level: LogLevel, scope: string, message: string): string {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] [${scope}] ${message}`
}

export const logger = {
    debug(scope: string, message: string, meta?: unknown): void {
        if (!shouldLog('debug')) {
            return
        }

        console.debug(formatMessage('debug', scope, message), meta ?? '')
    },

    info(scope: string, message: string, meta?: unknown): void {
        if (!shouldLog('info')) {
            return
        }

        console.info(formatMessage('info', scope, message), meta ?? '')
    },

    warn(scope: string, message: string, meta?: unknown): void {
        if (!shouldLog('warn')) {
            return
        }

        console.warn(formatMessage('warn', scope, message), meta ?? '')
    },

    error(scope: string, message: string, meta?: unknown): void {
        if (!shouldLog('error')) {
            return
        }

        console.error(formatMessage('error', scope, message), meta ?? '')
    },
}
