/**
 * AgroScan AI - AuthSessionManager (Compatibility Adapter).
 * Re-exports AuthSession for backwards compatibility.
 */

export { AuthSession as AuthSessionManager, AuthSession } from './AuthSession';
export type { StoredSession } from './AuthSession';
