/**
 * AgroScan AI - Centralized Security Interceptor & API Service Wrapper.
 *
 * Inspects all outgoing HTTP calls, injects JWT tokens, and intercepts HTTP 401 Unauthorized
 * or 403 Forbidden responses to automatically flush expired sessions and trigger AuthGate.
 */

import { ApiService } from './apiService';
import { AuthSession } from '../models/AuthSession';

/**
 * Standard fetch wrapper that intercepts 401 Unauthorized errors and clears invalid sessions.
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {},
  includeJson: boolean = false
): Promise<Response> => {
  return ApiService.authFetch(url, options, includeJson);
};

export { ApiService, AuthSession };
export default ApiService;
