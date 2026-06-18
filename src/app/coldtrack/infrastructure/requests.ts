import { UserRole } from '../../iam/domain/model/user.entity';

/**
 * @summary Request payload used to create a ColdTrack account.
 * @author HackRats
 */
export interface CreateUserRequest {
  /** User full name. */
  fullName: string;
  /** User e-mail. */
  email: string;
  /** User role. */
  role: UserRole;
  /** Account password. */
  password: string;
}

/**
 * @summary Request payload used to create a shipment.
 * @author HackRats
 */
export interface CreateShipmentRequest {
  /** Destination city. */
  destination: string;
  /** Assigned driver. */
  driver: string;
  /** Cargo description. */
  cargoDescription: string;
  /** Departure date and time. */
  departureAt: string;
  /** Estimated arrival date and time. */
  estimatedArrivalAt: string;
}

/**
 * @summary Request payload used to create a sensor.
 * @author HackRats
 */
export interface CreateSensorRequest {
  /** New sensor code. */
  id: string;
}
