import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { UserEntity } from '../domain/model/user.entity';
import { ColdtrackApiResource } from '../../coldtrack/infrastructure/coldtrack-api-resource';
import { CreateUserRequest } from '../../coldtrack/infrastructure/requests';

/**
 * @summary Signal-based authentication state for ColdTrack.
 * @author HackRats
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ColdtrackApiResource);
  private readonly currentUserSignal = signal<UserEntity | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  /** Current logged-in user. */
  readonly currentUser = this.currentUserSignal.asReadonly();
  /** True when a user is logged in. */
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
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
    this.api.findUsersByCredentials(email, password)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: users => {
          const user = users.at(0);
          if (user) {
            this.currentUserSignal.set(user);
            return;
          }
          this.errorSignal.set('auth.invalidCredentials');
        },
        error: () => this.errorSignal.set('auth.apiUnavailable')
      });
  }

  /**
   * Creates an account and starts a session for that account.
   * @param request - Account creation request.
   */
  signUp(request: CreateUserRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.createUser(request)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: user => this.currentUserSignal.set(user),
        error: () => this.errorSignal.set('auth.apiUnavailable')
      });
  }

  /** Ends the current session. */
  signOut(): void {
    this.currentUserSignal.set(null);
  }
}
