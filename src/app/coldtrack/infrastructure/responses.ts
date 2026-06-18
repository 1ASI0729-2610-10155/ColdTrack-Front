import { AlertEntity } from '../domain/model/alert.entity';
import { SensorEntity } from '../domain/model/sensor.entity';
import { ShipmentEntity } from '../domain/model/shipment.entity';

/**
 * @summary Response DTO for users returned by the backend API.
 * @author HackRats
 */
export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AuthenticatedUserResponse {
  user: UserResponse;
  token: string;
  tokenType: string;
}

/**
 * @summary Response DTO for shipment resources returned by the backend API.
 * @author HackRats
 */
export type ShipmentResponse = ShipmentEntity;

/**
 * @summary Response DTO for sensor resources returned by the backend API.
 * @author HackRats
 */
export type SensorResponse = SensorEntity;

/**
 * @summary Response DTO for alert resources returned by the backend API.
 * @author HackRats
 */
export type AlertResponse = AlertEntity;
