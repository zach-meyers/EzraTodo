import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { isAxiosError, isErrorResponse, getErrorType, getErrorMessage, parseError } from './errorUtils';
import type { ErrorResponse } from '../types/error.types';

describe('errorUtils', () => {
  describe('isAxiosError', () => {
    it('returns true for axios errors', () => {
      const axiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed',
      } as AxiosError;

      expect(isAxiosError(axiosError)).toBe(true);
    });

    it('returns false for non-axios errors', () => {
      const regularError = new Error('Regular error');
      expect(isAxiosError(regularError)).toBe(false);
    });

    it('returns false for null or undefined', () => {
      expect(isAxiosError(null)).toBe(false);
      expect(isAxiosError(undefined)).toBe(false);
      expect(isAxiosError({})).toBe(false);
    });
  });

  describe('isErrorResponse', () => {
    it('returns true for valid ErrorResponse objects', () => {
      const errorResponse: ErrorResponse = {
        traceId: '123',
        statusCode: 400,
        errorCode: 'BAD_REQUEST',
        message: 'Invalid request',
        timestamp: '2024-01-01T00:00:00Z',
      };

      expect(isErrorResponse(errorResponse)).toBe(true);
    });

    it('returns false for objects missing required fields', () => {
      const invalidResponse = {
        traceId: '123',
        statusCode: 400,
        // missing errorCode and message
      };

      expect(isErrorResponse(invalidResponse)).toBe(false);
    });

    it('returns false for non-objects', () => {
      expect(isErrorResponse(null)).toBe(false);
      expect(isErrorResponse(undefined)).toBe(false);
      expect(isErrorResponse('string')).toBe(false);
      expect(isErrorResponse(123)).toBe(false);
    });
  });

  describe('getErrorType', () => {
    it('returns "network" for network errors', () => {
      const networkError = {
        isAxiosError: true,
        response: undefined,
      } as AxiosError;

      expect(getErrorType(networkError)).toBe('network');
    });

    it('returns "auth" for 401 errors', () => {
      const authError = {
        isAxiosError: true,
        response: { status: 401 },
      } as AxiosError;

      expect(getErrorType(authError)).toBe('auth');
    });

    it('returns "auth" for 403 errors', () => {
      const forbiddenError = {
        isAxiosError: true,
        response: { status: 403 },
      } as AxiosError;

      expect(getErrorType(forbiddenError)).toBe('auth');
    });

    it('returns "notFound" for 404 errors', () => {
      const notFoundError = {
        isAxiosError: true,
        response: { status: 404 },
      } as AxiosError;

      expect(getErrorType(notFoundError)).toBe('notFound');
    });

    it('returns "validation" for 400 errors', () => {
      const validationError = {
        isAxiosError: true,
        response: { status: 400 },
      } as AxiosError;

      expect(getErrorType(validationError)).toBe('validation');
    });

    it('returns "validation" for 400 with VALIDATION_ERROR code', () => {
      const validationError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            traceId: '123',
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            message: 'Validation failed',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError;

      expect(getErrorType(validationError)).toBe('validation');
    });

    it('returns "server" for 500 errors', () => {
      const serverError = {
        isAxiosError: true,
        response: { status: 500 },
      } as AxiosError;

      expect(getErrorType(serverError)).toBe('server');
    });

    it('returns "server" for 503 errors', () => {
      const serverError = {
        isAxiosError: true,
        response: { status: 503 },
      } as AxiosError;

      expect(getErrorType(serverError)).toBe('server');
    });

    it('returns "unknown" for non-axios errors', () => {
      const regularError = new Error('Regular error');
      expect(getErrorType(regularError)).toBe('unknown');
    });
  });

  describe('getErrorMessage', () => {
    it('extracts message from ErrorResponse', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            traceId: '123',
            statusCode: 400,
            errorCode: 'BAD_REQUEST',
            message: 'Invalid email format',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError;

      expect(getErrorMessage(axiosError)).toBe('Invalid email format');
    });

    it('extracts message from object with message property', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            message: 'Custom error message',
          },
        },
      } as AxiosError;

      expect(getErrorMessage(axiosError)).toBe('Custom error message');
    });

    it('returns Error message for Error instances', () => {
      const error = new Error('Standard error message');
      expect(getErrorMessage(error)).toBe('Standard error message');
    });

    it('returns string error as-is', () => {
      const error = 'String error';
      expect(getErrorMessage(error)).toBe('String error');
    });

    it('returns default message for unknown errors', () => {
      const error = { something: 'weird' };
      expect(getErrorMessage(error)).toBe('An unexpected error occurred');
    });
  });

  describe('parseError', () => {
    it('parses axios error with ErrorResponse', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            traceId: 'trace-123',
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            message: 'Validation failed',
            timestamp: '2024-01-01T00:00:00Z',
            validationErrors: {
              email: ['Email is required'],
              password: ['Password must be at least 6 characters'],
            },
          },
        },
      } as AxiosError;

      const parsed = parseError(axiosError);

      expect(parsed).toEqual({
        type: 'validation',
        message: 'Validation failed',
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        traceId: 'trace-123',
        validationErrors: {
          email: ['Email is required'],
          password: ['Password must be at least 6 characters'],
        },
      });
    });

    it('parses network error', () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;
      networkError.response = undefined;

      const parsed = parseError(networkError);

      expect(parsed).toEqual({
        type: 'network',
        message: 'Network Error',
      });
    });

    it('parses 404 error', () => {
      const notFoundError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            traceId: 'trace-456',
            statusCode: 404,
            errorCode: 'NOT_FOUND',
            message: 'Todo with id 123 not found',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError;

      const parsed = parseError(notFoundError);

      expect(parsed).toEqual({
        type: 'notFound',
        message: 'Todo with id 123 not found',
        statusCode: 404,
        errorCode: 'NOT_FOUND',
        traceId: 'trace-456',
      });
    });

    it('parses auth error', () => {
      const authError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            traceId: 'trace-789',
            statusCode: 401,
            errorCode: 'UNAUTHORIZED',
            message: 'Invalid credentials',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError;

      const parsed = parseError(authError);

      expect(parsed).toEqual({
        type: 'auth',
        message: 'Invalid credentials',
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        traceId: 'trace-789',
      });
    });

    it('parses server error', () => {
      const serverError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            traceId: 'trace-server',
            statusCode: 500,
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            timestamp: '2024-01-01T00:00:00Z',
          },
        },
      } as AxiosError;

      const parsed = parseError(serverError);

      expect(parsed).toEqual({
        type: 'server',
        message: 'An unexpected error occurred',
        statusCode: 500,
        errorCode: 'INTERNAL_SERVER_ERROR',
        traceId: 'trace-server',
      });
    });

    it('parses non-axios errors', () => {
      const error = new Error('Something went wrong');
      const parsed = parseError(error);

      expect(parsed).toEqual({
        type: 'unknown',
        message: 'Something went wrong',
      });
    });
  });
});
