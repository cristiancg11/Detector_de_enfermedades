/**
 * AgroScan AI - Auth Session Manager (OOP Domain Layer).
 *
 * Encapsulates authentication state, user credentials persistence in localStorage,
 * and pre-configured Andean smallholder demo identities for rapid field testing.
 */

import { UserProfile } from '../types';

export interface StoredSession {
  token: string;
  user: UserProfile;
  expiresAt: number;
}

export class AuthSessionManager {
  private static readonly STORAGE_KEY = 'agroscan_auth_session_v1';

  /**
   * Pre-configured Andean smallholder demo accounts for instant evaluation.
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
      municipality: 'Pasto (Volcano Foothills)',
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
   * Retrieves active session from localStorage if valid.
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
    } catch {
      return null;
    }
  }

  /**
   * Returns current authenticated user or null.
   */
  public static getCurrentUser(): UserProfile | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Returns access token for API authorization header.
   */
  public static getToken(): string | null {
    const session = this.getSession();
    return session ? session.token : null;
  }

  /**
   * Returns true if user session is active.
   */
  public static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Saves authentication session in localStorage (valid for 7 days).
   */
  public static saveSession(token: string, user: UserProfile): void {
    const session: StoredSession = {
      token,
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Removes session on logout.
   */
  public static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Signs in immediately with a demo farmer account without remote network latency.
   */
  public static loginAsDemo(email: string): { token: string; user: UserProfile } {
    const profile =
      this.DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      this.DEMO_PROFILES[0];

    const token = `demo-token-${profile.id}-${Date.now()}`;
    this.saveSession(token, profile);
    return { token, user: profile };
  }
}
