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
   * Pre-configured Andean smallholder and agronomist demo identities.
   */
  public static readonly DEMO_PROFILES: UserProfile[] = [
    {
      id: 'usr-carlos-guancha',
      email: 'carlos@agroscan.co',
      fullName: 'Don Carlos Guancha',
      farmName: 'Finca Bella Vista',
      municipality: 'Túquerres (Plateau)',
      role: 'Smallholder Farmer',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'usr-elena-bastidas',
      email: 'elena@agrosavia.co',
      fullName: 'Dra. Elena Bastidas',
      farmName: 'Centro Obonuco (AGROSAVIA)',
      municipality: 'Pasto (Galeras Foothills)',
      role: 'Agronomist / Extensionist',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-10T09:30:00Z',
    },
    {
      id: 'usr-mariana-jojoa',
      email: 'mariana.jojoa@cafesandona.org',
      fullName: 'Doña Mariana Jojoa',
      farmName: 'Cafetal El Mirador',
      municipality: 'Sandoná (Western Ridge)',
      role: 'Cooperative Producer',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-03-01T10:00:00Z',
    },
  ];

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
      return parsed;
    } catch (err) {
      console.warn('Failed to read auth session from storage:', err);
      return null;
    }
  }

  /**
   * Persists authentication session token and farmer profile into localStorage
   * and notifies all reactive subscribers.
   */
  public static saveSession(token: string, profile: UserProfile): void {
    const session: StoredSession = {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        farmName: profile.farmName,
        municipality: profile.municipality || 'Túquerres (High Plateau)',
        role: profile.role || 'Smallholder Farmer',
        avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.email}`,
        createdAt: profile.createdAt || new Date().toISOString(),
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

    const hasValidToken = typeof session.token === 'string' && session.token.trim().length > 0;
    const hasValidUser = session.user && typeof session.user.id === 'string' && session.user.id.trim().length > 0;
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
   * Instant sign-in with pre-configured Andean demo account.
   */
  public static loginAsDemo(email: string): { token: string; user: UserProfile } {
    const profile =
      this.DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      this.DEMO_PROFILES[0];

    const token = `demo-jwt-token-${profile.id}-${Date.now()}`;
    this.saveSession(token, profile);
    return { token, user: profile };
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
