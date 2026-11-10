/**
 * AgroScan AI - Object-Oriented Diagnostic API Client.
 *
 * Encapsulates HTTP transport, JWT Bearer token authentication, security interceptors,
 * error handling, and payload normalization into a clean, reusable client architecture.
 */

import { AuthSession } from '../models/AuthSession';
import { CropDiagnosticRequest } from '../models/CropDiagnosticRequest';
import { DiagnosticReport } from '../models/DiagnosticReport';
import { DosageCalculationRequest, DosagePrescription } from '../models/DosagePrescription';
import {
  ChatMessage,
  ChatFollowUpRequest,
  ChatFollowUpResponse,
  RawDiagnosticResponse,
} from '../types';

export class DiagnosticApiClient {
  private static defaultInstance: DiagnosticApiClient | null = null;
  private baseUrl: string;

  public constructor(baseUrl: string = 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Singleton accessor for shared global client.
   */
  public static getInstance(): DiagnosticApiClient {
    if (!DiagnosticApiClient.defaultInstance) {
      DiagnosticApiClient.defaultInstance = new DiagnosticApiClient();
    }
    return DiagnosticApiClient.defaultInstance;
  }

  /**
   * Generates authorization headers with the current JWT token.
   */
  public getHeaders(includeJson: boolean = false): Record<string, string> {
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
   * Authenticated HTTP request execution with automatic token expiration interception.
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    includeJson: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...this.getHeaders(includeJson),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      console.warn(`[DiagnosticApiClient] HTTP ${response.status} at ${url}. Clearing expired session.`);
      AuthSession.clearSession();
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        // Fallback to status text
      }
      throw new Error(errorMessage);
    }

    // 204 No Content
    if (response.status === 204) {
      return null as unknown as T;
    }

    return (await response.json()) as T;
  }

  /**
   * Submits a phytosanitary diagnostic request with image and field parameters.
   */
  public async sendDiagnostic(
    payload: FormData | CropDiagnosticRequest,
    previewUrl?: string
  ): Promise<DiagnosticReport> {
    const formData = payload instanceof FormData ? payload : payload.toFormData();

    const rawData = await this.request<RawDiagnosticResponse>(
      '/diagnose',
      {
        method: 'POST',
        body: formData,
      },
      false
    );

    return DiagnosticReport.fromJSON(rawData, previewUrl);
  }

  /**
   * Sends an agronomic follow-up consultation question to the AI assistant.
   */
  public async sendChatMessage(
    diagnosticId: string,
    message: string,
    history?: ChatMessage[]
  ): Promise<ChatFollowUpResponse> {
    const payload: ChatFollowUpRequest = {
      diagnostic_id: diagnosticId,
      message,
      chat_history: history,
    };

    try {
      return await this.request<ChatFollowUpResponse>(
        `/diagnose/${encodeURIComponent(diagnosticId)}/chat`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );
    } catch {
      // Fallback to alternative chat endpoint
      return await this.request<ChatFollowUpResponse>(
        '/chat/followup',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );
    }
  }

  /**
   * Fetches persisted diagnostic reports from MongoDB Atlas.
   */
  public async getPlotHistory(
    page: number = 1,
    limit: number = 50
  ): Promise<{ items: DiagnosticReport[]; total: number }> {
    const data = await this.request<{ items: RawDiagnosticResponse[]; total: number }>(
      `/diagnose/history?page=${page}&limit=${limit}`,
      { method: 'GET' },
      false
    );

    const reports = (data.items || []).map((raw) =>
      DiagnosticReport.fromJSON(raw, raw.image_url)
    );

    return {
      items: reports,
      total: data.total || reports.length,
    };
  }

  /**
   * Calculates tailored 20L backpack dosage instructions.
   */
  public async calculateDosage(
    req: DosageCalculationRequest
  ): Promise<DosagePrescription> {
    const data = await this.request(
      '/dosage/calculate',
      {
        method: 'POST',
        body: JSON.stringify(req),
      },
      true
    );

    return new DosagePrescription(data);
  }

  /**
   * Deletes a diagnostic report from persistent cloud storage.
   */
  public async deleteReport(id: string): Promise<boolean> {
    try {
      await this.request(`/diagnose/${encodeURIComponent(id)}`, { method: 'DELETE' }, false);
      return true;
    } catch (err) {
      console.error(`[DiagnosticApiClient] Failed to delete report ${id}:`, err);
      return false;
    }
  }
}
