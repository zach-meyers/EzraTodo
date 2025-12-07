import { AxiosError } from 'axios';
import type { ErrorResponse, ErrorType, ParsedError } from '../types/error.types';

/**
 * Checks if error is an axios error
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return error != null && (error as AxiosError).isAxiosError === true;
}

/**
 * Checks if error has the shape of our ErrorResponse
 */
export function isErrorResponse(data: unknown): data is ErrorResponse {
  if (!data || typeof data !== 'object') return false;

  const response = data as ErrorResponse;
  return (
    typeof response.traceId === 'string' &&
    typeof response.statusCode === 'number' &&
    typeof response.errorCode === 'string' &&
    typeof response.message === 'string'
  );
}

/**
 * Determines the error type based on status code and error properties
 */
export function getErrorType(error: unknown): ErrorType {
  if (!isAxiosError(error)) {
    return 'unknown';
  }

  const statusCode = error.response?.status;

  if (!statusCode) {
    // Network error (no response)
    return 'network';
  }

  if (statusCode === 401 || statusCode === 403) {
    return 'auth';
  }

  if (statusCode === 404) {
    return 'notFound';
  }

  if (statusCode === 400) {
    const data = error.response?.data;
    if (isErrorResponse(data) && data.errorCode === 'VALIDATION_ERROR') {
      return 'validation';
    }
    return 'validation'; // Treat all 400s as validation by default
  }

  if (statusCode >= 500) {
    return 'server';
  }

  return 'unknown';
}

/**
 * Extracts a user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  // check if it's an axios error with our ErrorResponse format
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data;

    if (isErrorResponse(data)) {
      return data.message;
    }

    if (typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Parses an axios error or generic error into a standardized ParsedError
 */
export function parseError(error: unknown): ParsedError {
  const type = getErrorType(error);
  const message = getErrorMessage(error);

  const parsed: ParsedError = {
    type,
    message,
  };

  // Extract additional details from axios errors
  if (isAxiosError(error) && error.response?.data && isErrorResponse(error.response.data)) {
    const errorResponse = error.response.data;

    parsed.statusCode = errorResponse.statusCode;
    parsed.errorCode = errorResponse.errorCode;
    parsed.traceId = errorResponse.traceId;
    parsed.validationErrors = errorResponse.validationErrors;
  }

  return parsed;
}
