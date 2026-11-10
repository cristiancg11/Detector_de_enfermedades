/**
 * AgroScan AI - Client-Side AuthSession Model (OOP Domain Layer).
 *
 * Encapsulates authenticated user token, farmer profile (id, email, fullName, farmName),
 * persistent session state in browser localStorage with expiration handling,
 * and reactive authentication state change event dispatchers.
 */

import { UserProfile } from '../types';

export interface StoredSession {
  token: string;
  user: UserProfile;
  expiresAt: number;
}

export type AuthStateCallback = (isAuthenticated: boolean) => void;

export class AuthSession {
  private static readonly STORAGE_KEY = 'agroscan_auth_session_v1';
  private static readonly SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly listeners: Set<AuthStateCallback> = new Set();

  public readonly token: string | null;
  public readonly user: UserProfile | null;
  public readonly expiresAt: number;

  constructor(token: string | null = null, user: UserProfile | null = null, expiresAt?: number) {
    this.token = token;
    this.user = user;
    this.expiresAt = expiresAt || (Date.now() + AuthSession.SESSION_DURATION_MS);
  }

  /**
   * Subscribes a reactive listener to authentication state changes.
   * Returns an unsubscribe function.
   */
  public static onAuthStateChange(callback: AuthStateCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Dispatches the current authentication state to all registered subscribers.
   */
  private static notifyListeners(): void {
    const authenticated = this.isAuthenticated();
    this.listeners.forEach((callback) => {
      try {
        callback(authenticated);
      } catch (err) {
        console.error('Error invoking AuthState listener callback:', err);
      }
    });
  }

  /**
   * Retrieves active session from localStorage if present and valid.
   */
  public static getSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed: StoredSession = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      if (Date.now() > parsed.expiresAt) {
        this.clearSession();
        return null;
      }

      // Purge any legacy demo or mock tokens
      if (typeof parsed.token === 'string' && (parsed.token.startsWith('demo-') || parsed.token.startsWith('offline-jwt-'))) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch (err) {
      console.warn('Failed to read auth session from storage:', err);
      return null;
    }
  }

  /**
   * Persists authentication session token and farmer profile into localStorage
   * and notifies all reactive subscribers. Handles both UserProfile and raw auth responses.
   */
  public static saveSession(token: string, profile: any): void {
    const userObj = profile?.user || profile || {};
    const session: StoredSession = {
      token,
      user: {
        id: userObj.id || profile.id || `usr-${Date.now()}`,
        email: userObj.email || profile.email || '',
        fullName:
          userObj.full_name ||
          userObj.fullName ||
          profile.full_name ||
          profile.fullName ||
          'Registered Farmer',
        farmName:
          userObj.farm_name ||
          userObj.farmName ||
          profile.farm_name ||
          profile.farmName ||
          'Andean Farm',
        municipality:
          userObj.municipality ||
          profile.municipality ||
          'Túquerres (High Plateau)',
        role:
          userObj.role ||
          profile.role ||
          'Smallholder Farmer',
        avatarUrl:
          userObj.avatar_url ||
          userObj.avatarUrl ||
          profile.avatar_url ||
          profile.avatarUrl ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${userObj.email || profile.email || 'farmer'}`,
        createdAt:
          userObj.created_at ||
          userObj.createdAt ||
          profile.created_at ||
          profile.createdAt ||
          new Date().toISOString(),
      },
      expiresAt: Date.now() + this.SESSION_DURATION_MS,
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      this.notifyListeners();
    } catch (err) {
      console.error('Failed to store auth session:', err);
    }
  }

  /**
   * Returns active JWT access token or null.
   */
  public static getToken(): string | null {
    const session = this.getSession();
    return session ? session.token : null;
  }

  /**
   * Returns current authenticated farmer profile or null.
   */
  public static getUser(): UserProfile | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Alias for getUser() to ensure backwards compatibility across callers.
   */
  public static getCurrentUser(): UserProfile | null {
    return this.getUser();
  }

  /**
   * Strictly validates whether a valid, non-expired authentication session exists in localStorage.
   */
  public static isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const hasValidToken =
      typeof session.token === 'string' &&
      session.token.trim().length > 0 &&
      !session.token.startsWith('demo-') &&
      !session.token.startsWith('offline-jwt-');
    const hasValidUser =
      session.user && typeof session.user.id === 'string' && session.user.id.trim().length > 0;
    const isUnexpired = typeof session.expiresAt === 'number' && Date.now() < session.expiresAt;

    return Boolean(hasValidToken && hasValidUser && isUnexpired);
  }

  /**
   * Clears session from localStorage on sign-out and notifies subscribers.
   */
  public static clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.notifyListeners();
    } catch (err) {
      console.error('Failed to clear auth session:', err);
    }
  }

  /**
   * Flushes authentication session and invalidates access across the application.
   */
  public static logout(): void {
    this.clearSession();
  }

  /**
   * Formats authorization header string.
   */
  public getAuthorizationHeader(): string | null {
    return this.token ? `Bearer ${this.token}` : null;
  }

  /**
   * Validates if instance session is non-expired.
   */
  public isValid(): boolean {
    return Boolean(this.token && this.user && Date.now() < this.expiresAt);
  }
}
