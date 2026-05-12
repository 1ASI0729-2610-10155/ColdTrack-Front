import { AlertEntity } from '../domain/model/alert.entity';
import { SensorEntity } from '../domain/model/sensor.entity';
import { ShipmentEntity } from '../domain/model/shipment.entity';
import { UserEntity } from '../../iam/domain/model/user.entity';

/**
 * @summary Response DTO for user resources returned by the fake API.
 * @author HackRats
 */
export type UserResponse = UserEntity;

/**
 * @summary Response DTO for shipment resources returned by the fake API.
 * @author HackRats
 */
export type ShipmentResponse = ShipmentEntity;

/**
 * @summary Response DTO for sensor resources returned by the fake API.
 * @author HackRats
 */
export type SensorResponse = SensorEntity;

/**
 * @summary Response DTO for alert resources returned by the fake API.
 * @author HackRats
 */
export type AlertResponse = AlertEntity;
