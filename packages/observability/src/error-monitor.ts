export interface ErrorRecord {
  id: string;
  timestamp: Date;
  type: "agent" | "api" | "deployment" | "validation" | "unknown";
  message: string;
  stack?: string | undefined;
  context: {
    agentId?: string | undefined;
    projectId?: string | undefined;
    userId?: string | undefined;
    model?: string | undefined;
    step?: string | undefined;
    traceId?: string | undefined;
  };
  resolved: boolean;
}

export interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  byAgent: Record<string, number>;
  recentErrors: ErrorRecord[];
  errorRate: number; // errors per hour
}

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface Alert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  message: string;
  context?: Record<string, unknown> | undefined;
  acknowledged: boolean;
}

export interface ErrorMonitorOptions {
  onAlert?: ((alert: Alert) => void) | undefined;
}

export class ErrorMonitor {
  private errors: ErrorRecord[] = [];
  private alerts: Alert[] = [];
  private successCount: number = 0;
  private alertCallback?: ((alert: Alert) => void) | undefined;

  constructor(options?: ErrorMonitorOptions) {
    this.alertCallback = options?.onAlert;
  }

  /**
   * Record an error
   */
  recordError(error: {
    type: ErrorRecord["type"];
    message: string;
    stack?: string | undefined;
    context?: ErrorRecord["context"] | undefined;
  }): ErrorRecord {
    const record: ErrorRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: error.type,
      message: error.message,
      stack: error.stack,
      context: error.context ?? {},
      resolved: false,
    };

    this.errors.push(record);
    this.checkErrorPatterns(record);

    return record;
  }

  /**
   * Record a success (for error rate calculation)
   */
  recordSuccess(): void {
    this.successCount++;
  }

  /**
   * Capture an exception
   */
  captureException(
    error: Error,
    context?: ErrorRecord["context"]
  ): ErrorRecord {
    return this.recordError({
      type: this.inferErrorType(error),
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Create an alert
   */
  alert(
    severity: AlertSeverity,
    message: string,
    context?: Record<string, unknown>
  ): Alert {
    const alert: Alert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      severity,
      message,
      acknowledged: false,
    };

    if (context !== undefined) {
      alert.context = context;
    }

    this.alerts.push(alert);

    if (this.alertCallback) {
      this.alertCallback(alert);
    }

    return alert;
  }

  /**
   * Get error statistics
   */
  getStats(options?: { hours?: number | undefined }): ErrorStats {
    const hours = options?.hours ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentErrors = this.errors.filter((e) => e.timestamp >= since);

    const byType: Record<string, number> = {};
    const byAgent: Record<string, number> = {};

    for (const error of recentErrors) {
      byType[error.type] = (byType[error.type] ?? 0) + 1;
      if (error.context.agentId) {
        byAgent[error.context.agentId] =
          (byAgent[error.context.agentId] ?? 0) + 1;
      }
    }

    const totalRequests = recentErrors.length + this.successCount;
    const errorRate =
      totalRequests > 0 ? (recentErrors.length / totalRequests) * 100 : 0;

    return {
      total: recentErrors.length,
      byType,
      byAgent,
      recentErrors: recentErrors.slice(-20), // Last 20
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * Get unacknowledged alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): void {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  /**
   * Check for error patterns and alert
   */
  private checkErrorPatterns(error: ErrorRecord): void {
    const recentSimilar = this.errors.filter(
      (e) =>
        e.type === error.type &&
        e.timestamp >= new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    // Alert if same error type happens 5+ times in 5 minutes
    if (recentSimilar.length >= 5 && recentSimilar.length < 10) {
      this.alert(
        "warning",
        `Repeated ${error.type} errors: ${recentSimilar.length} in 5 minutes`,
        {
          errorType: error.type,
          count: recentSimilar.length,
          latestMessage: error.message,
        }
      );
    }

    // Critical alert for 10+ errors
    if (recentSimilar.length >= 10) {
      this.alert(
        "critical",
        `Critical error rate: ${recentSimilar.length} ${error.type} errors in 5 minutes`,
        {
          errorType: error.type,
          count: recentSimilar.length,
        }
      );
    }
  }

  /**
   * Infer error type from exception
   */
  private inferErrorType(error: Error): ErrorRecord["type"] {
    const message = error.message.toLowerCase();

    if (
      message.includes("agent") ||
      message.includes("model") ||
      message.includes("token")
    ) {
      return "agent";
    }

    if (
      message.includes("api") ||
      message.includes("fetch") ||
      message.includes("request")
    ) {
      return "api";
    }

    if (
      message.includes("deploy") ||
      message.includes("build") ||
      message.includes("github")
    ) {
      return "deployment";
    }

    if (
      message.includes("valid") ||
      message.includes("typescript") ||
      message.includes("lint")
    ) {
      return "validation";
    }

    return "unknown";
  }

  /**
   * Export for persistence
   */
  exportData(): { errors: ErrorRecord[]; alerts: Alert[] } {
    return {
      errors: [...this.errors],
      alerts: [...this.alerts],
    };
  }

  /**
   * Import from persistence
   */
  importData(data: { errors: ErrorRecord[]; alerts: Alert[] }): void {
    this.errors = data.errors.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
    this.alerts = data.alerts.map((a) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
  }

  /**
   * Clear old data
   */
  prune(olderThan: Date): { errors: number; alerts: number } {
    const errorCount = this.errors.length;
    const alertCount = this.alerts.length;

    this.errors = this.errors.filter((e) => e.timestamp >= olderThan);
    this.alerts = this.alerts.filter((a) => a.timestamp >= olderThan);

    return {
      errors: errorCount - this.errors.length,
      alerts: alertCount - this.alerts.length,
    };
  }
}
