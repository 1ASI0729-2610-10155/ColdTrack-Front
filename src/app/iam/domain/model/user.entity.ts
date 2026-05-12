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
  /** Plain password for the local fake API demo. */
  password: string;
  /** Access role assigned to the account. */
  role: UserRole;
}

/** Available roles for ColdTrack accounts. */
export type UserRole = 'LOGISTICS_ADMIN' | 'DRIVER' | 'QUALITY_SUPERVISOR';
