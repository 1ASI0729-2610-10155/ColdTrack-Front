/**
 * @summary Represents an authenticated ColdTrack user account.
 * @author HackRats
 */
export interface UserEntity {
  /** Unique user identifier. */
  id: number;
  /** User display name. */
  fullName: string;
  /** User e-mail used as login credential. */
  email: string;
  /** Access roles assigned to the account. */
  roles: UserRole[];
}

/** Available roles for ColdTrack accounts. */
export type UserRole = 'LOGISTICS_ADMIN' | 'DRIVER' | 'QUALITY_SUPERVISOR';
