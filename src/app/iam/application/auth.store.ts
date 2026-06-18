import { inject, Injectable, signal } from '@angular/core';
import { finalize, switchMap } from 'rxjs';
import { ColdtrackApiResource } from '../../coldtrack/infrastructure/coldtrack-api-resource';
import { CreateUserRequest } from '../../coldtrack/infrastructure/requests';
import { AuthSession } from '../infrastructure/auth-session';

/**
 * @summary Signal-based authentication state for ColdTrack.
 * @author HackRats
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ColdtrackApiResource);
  private readonly session = inject(AuthSession);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  /** Current logged-in user. */
  readonly currentUser = this.session.currentUser;
  /** True when a user is logged in. */
  readonly isAuthenticated = this.session.isAuthenticated;
  /** Authentication loading flag. */
  readonly loading = this.loadingSignal.asReadonly();
  /** Last authentication error. */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Attempts to sign in with e-mail and password.
   * @param email - User e-mail.
   * @param password - User password.
   */
  signIn(email: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.signIn(email, password)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: session => this.session.start(session),
        error: () => this.errorSignal.set('auth.invalidCredentials')
      });
  }

  /**
   * Creates an account and starts a session for that account.
   * @param request - Account creation request.
   */
  signUp(request: CreateUserRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.signUp(request)
      .pipe(switchMap(() => this.api.signIn(request.email, request.password)))
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: session => this.session.start(session),
        error: () => this.errorSignal.set('auth.apiUnavailable')
      });
  }

  /** Ends the current session. */
  signOut(): void {
    this.session.clear();
  }
}
