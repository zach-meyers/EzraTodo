export interface ErrorResponse {
  traceId: string;
  statusCode: number;
  errorCode: string;
  message: string;
  details?: string;
  validationErrors?: Record<string, string[]>;
  timestamp: string;
}

export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
  traceId?: string;
  validationErrors?: Record<string, string[]>;
}

export type ErrorType = 'network' | 'auth' | 'validation' | 'notFound' | 'server' | 'unknown';

export interface ParsedError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  errorCode?: string;
  traceId?: string;
  validationErrors?: Record<string, string[]>;
}
