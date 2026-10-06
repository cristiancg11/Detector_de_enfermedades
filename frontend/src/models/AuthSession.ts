/**
/**
 * AgroScan AI - AuthSession Model (OOP Domain Layer).
 *
 * Encapsulates authenticated user token, farmer profile, and session persistence
 * in browser localStorage with expiration handling and demo identities.
 */

import { UserProfile } from '../types';

export interface StoredSession {
  token: string;
  user: UserProfile;
  expiresAt: number;
}

export class AuthSession {
  private static readonly STORAGE_KEY = 'agroscan_auth_session_v1';
  private static readonly SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
   * Retrieves active session from localStorage if present and unexpired.
   */
  public static getSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed: StoredSession = JSON.parse(raw);
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
   * Returns current authenticated user profile or null.
   */
  public static getCurrentUser(): UserProfile | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Returns active JWT access token or null.
   */
  public static getToken(): string | null {
    const session = this.getSession();
    return session ? session.token : null;
  }

  /**
   * Returns true if user session is currently valid and active.
   */
  public static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Persists authentication session into localStorage.
   */
  public static saveSession(token: string, user: UserProfile): void {
    const session: StoredSession = {
      token,
      user,
      expiresAt: Date.now() + this.SESSION_DURATION_MS,
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (err) {
      console.error('Failed to store auth session:', err);
    }
  }

  /**
   * Clears session from localStorage on sign-out.
   */
  public static clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear auth session:', err);
    }
  }

  /**
   * Instant sign-in with pre-configured Andean demo account.
   */
  public static loginAsDemo(email: string): { token: string; user: UserProfile } {
    const profile =
      this.DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      this.DEMO_PROFILES[0];

    const token = `demo-token-${profile.id}-${Date.now()}`;
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
