import { computed, Injectable, signal } from '@angular/core';
import { UserEntity } from '../domain/model/user.entity';

export interface AuthSessionData {
  user: UserEntity;
  token: string;
  tokenType: string;
}

const storageKey = 'coldtrack.auth.session';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly storage = typeof localStorage === 'undefined' ? null : localStorage;
  private readonly sessionSignal = signal<AuthSessionData | null>(this.restore());

  readonly currentUser = computed(() => this.sessionSignal()?.user ?? null);
  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  start(session: AuthSessionData): void {
    this.sessionSignal.set(session);
    this.storage?.setItem(storageKey, JSON.stringify(session));
  }

  clear(): void {
    this.sessionSignal.set(null);
    this.storage?.removeItem(storageKey);
  }

  private restore(): AuthSessionData | null {
    try {
      const serialized = this.storage?.getItem(storageKey);
      return serialized ? JSON.parse(serialized) as AuthSessionData : null;
    } catch {
      this.storage?.removeItem(storageKey);
      return null;
    }
  }
}
