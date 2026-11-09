/**
 * AgroScan AI - Centralized Security Interceptor & API Service Wrapper.
 *
 * Inspects all outgoing HTTP calls, injects JWT tokens, and intercepts HTTP 401 Unauthorized
 * or 403 Forbidden responses to automatically flush expired sessions and trigger AuthGate.
 */

import { ApiService } from './apiService';
import { AuthSession } from '../models/AuthSession';

export const API_BASE_URL = 'http://localhost:8000/api/v1';

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

export interface RegisterUserPayload {
  email: string;
  password: string;
  full_name: string;
  farm_name: string;
  municipality?: string;
  role?: string;
}

/**
 * Registers a new farmer on the FastAPI backend and saves the authenticated session.
 * Sends POST http://localhost:8000/api/v1/auth/register with JSON: { email, password, full_name, farm_name }
 */
export const registerUser = async (payload: RegisterUserPayload): Promise<any> => {
  const url = `${API_BASE_URL}/auth/register`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      farm_name: payload.farm_name,
    }),
  });

  if (!response.ok) {
    let errorDetail = `Registration failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  console.log('[AgroScan API] User registered successfully:', data);

  // Inspect response and save token in AuthSession.saveSession(data.access_token, data)
  if (data.access_token) {
    AuthSession.saveSession(data.access_token, data);
    console.log('[AgroScan API] Token and session persisted in AuthSession:', AuthSession.getToken());
  }

  return data;
};

export { ApiService, AuthSession };
export default ApiService;
