export interface LogEvent {
    timestamp?: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    service: string;
    environment?: string;
    message: string;
    context?: string;
    traceId?: string;
    userId?: string;
    requestId?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    tags?: string[];
    host?: string;
    ip?: string;
    durationMs?: number;
    error?: {
      name: string;
      message: string;
      stack: string;
    };
  }
  
  // types/audit-event.interface.ts
  export interface AuditEvent {
    id?: string;
    user_id: string;
    action: string;
    module: string;
    entity_id: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
    ip?: string;
    timestamp?: string;
  }