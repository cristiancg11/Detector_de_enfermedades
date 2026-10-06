/**
 * AgroScan AI - API Service Layer.
 * Handles HTTP communication with the FastAPI backend and MongoDB Atlas persistence.
 * Attaches JWT Bearer authentication to diagnostic and history requests.
 */

import { AuthSession } from '../models/AuthSession';
import { CropDiagnosticRequest } from '../models/CropDiagnosticRequest';
import { DiagnosticReport } from '../models/DiagnosticReport';
import {
  ChatMessage,
  ChatFollowUpRequest,
  ChatFollowUpResponse,
  RawDiagnosticResponse,
  UserProfile
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiService {
  /**
   * Helper to construct headers with Bearer token authentication.
   */
  private static getAuthHeaders(includeJson: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    const token = AuthSession.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Submits a diagnostic request to the backend with authenticated user headers.
   */
  public static async submitDiagnostic(
    request: CropDiagnosticRequest,
    previewUrl?: string
  ): Promise<DiagnosticReport> {
    const formData = request.toFormData();
    const headers = this.getAuthHeaders(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/diagnose`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          errorMessage = errData.detail || errorMessage;
        } catch {
          // Ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      const rawData: RawDiagnosticResponse = await response.json();
      return DiagnosticReport.fromJSON(rawData, previewUrl);
    } catch (error: any) {
      console.warn('Backend connection failed or server unreachable:', error?.message);
      throw error;
    }
  }

  /**
   * Retrieves diagnostic history from MongoDB Atlas filtered by user/plot.
   */
  public static async getHistory(
    plotIdentifier?: string,
    limit: number = 20
  ): Promise<{ total: number; items: DiagnosticReport[] }> {
    const headers = this.getAuthHeaders(true);
    const params = new URLSearchParams();
    if (plotIdentifier) params.append('plot_identifier', plotIdentifier);
    params.append('limit', limit.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/history?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch history (${response.status})`);
      }

      const data = await response.json();
      const reports = (data.items || []).map((raw: RawDiagnosticResponse) =>
        DiagnosticReport.fromJSON(raw)
      );
      return { total: data.total || reports.length, items: reports };
    } catch (error: any) {
      console.warn('History API request failed:', error?.message);
      return { total: 0, items: [] };
    }
  }

  /**
   * Checks the health status of the backend API and database connection.
   */
  public static async checkHealth(): Promise<{
    status: string;
    gemini_configured: boolean;
    mongodb_connected: boolean;
    model: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
        signal: AbortSignal.timeout(3500),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Silent catch on offline health check
    }
    return {
      status: 'offline',
      gemini_configured: false,
      mongodb_connected: false,
      model: 'gemini-2.5-flash',
    };
  }

  /**
   * Registers a new user account on the backend.
   */
  public static async register(data: {
    email: string;
    password: string;
    fullName: string;
    farmName: string;
    municipality: string;
    role: string;
  }): Promise<{ token: string; user: UserProfile }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        farm_name: data.farmName,
        municipality: data.municipality,
        role: data.role,
      }),
    });

    if (!response.ok) {
      let msg = 'Registration failed';
      try {
        const err = await response.json();
        msg = err.detail || msg;
      } catch {
        // fallback
      }
      throw new Error(msg);
    }

    const resData = await response.json();
    return {
      token: resData.access_token,
      user: {
        id: resData.user.id,
        email: resData.user.email,
        fullName: resData.user.full_name,
        farmName: resData.user.farm_name,
        municipality: resData.user.municipality,
        role: resData.user.role,
        avatarUrl: resData.user.avatar_url,
        createdAt: resData.user.created_at,
      },
    };
  }

  /**
   * Logs in an existing user with email and password credentials.
   */
  public static async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: UserProfile }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let msg = 'Invalid credentials';
      try {
        const err = await response.json();
        msg = err.detail || msg;
      } catch {
        // fallback
      }
      throw new Error(msg);
    }

    const resData = await response.json();
    return {
      token: resData.access_token,
      user: {
        id: resData.user.id,
        email: resData.user.email,
        fullName: resData.user.full_name,
        farmName: resData.user.farm_name,
        municipality: resData.user.municipality,
        role: resData.user.role,
        avatarUrl: resData.user.avatar_url,
        createdAt: resData.user.created_at,
      },
    };
  }

  /**
   * Fetches current authenticated farmer profile from the backend.
   */
  public static async getMe(): Promise<UserProfile> {
    const headers = this.getAuthHeaders(true);
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Unauthorized or session expired');
    }

    const user = await response.json();
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      farmName: user.farm_name,
      municipality: user.municipality,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    };
  }

  /**
   * Submits a contextual agronomic follow-up inquiry to Gemini 2.5 Flash.
   */
  public static async sendAgronomicChat(
    diagnosticId: string,
    message: string,
    chatHistory: ChatMessage[] = []
  ): Promise<ChatFollowUpResponse> {
    const headers = this.getAuthHeaders(true);

    const payload: ChatFollowUpRequest = {
      diagnostic_id: diagnosticId,
      message,
      chat_history: chatHistory,
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/diagnose/${diagnosticId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errData = await response.json();
        errorMsg = errData.detail || errorMsg;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }
}

