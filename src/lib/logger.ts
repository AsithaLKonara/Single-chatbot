// Production-grade structured JSON logger
// Optimized for cloud logging systems (Vercel, Datadog, CloudWatch)

type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
    userId?: string;
    sessionId?: string;
    tool?: string;
    action?: string;
    error?: any;
    [key: string]: any;
}

class Logger {
    private format(level: LogLevel, message: string, context?: LogContext) {
        const payload = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...context,
        };

        if (context?.error instanceof Error) {
            payload.error = {
                message: context.error.message,
                stack: context.error.stack,
            };
        }

        return JSON.stringify(payload);
    }

    info(message: string, context?: LogContext) {
        console.log(this.format("info", message, context));
    }

    warn(message: string, context?: LogContext) {
        console.warn(this.format("warn", message, context));
    }

    error(message: string, context?: LogContext) {
        console.error(this.format("error", message, context));
    }

    debug(message: string, context?: LogContext) {
        if (process.env.NODE_ENV !== "production") {
            console.debug(this.format("debug", message, context));
        }
    }

    // Trace the reasoning chain
    traceReasoning(goal: string, steps: any[]) {
        this.info(`[REASONING] Chain for: ${goal}`, {
            action: "ai_reasoning",
            steps: steps.map(s => ({ tool: s.tool, reason: s.reason }))
        });
    }
}

export const logger = new Logger();
