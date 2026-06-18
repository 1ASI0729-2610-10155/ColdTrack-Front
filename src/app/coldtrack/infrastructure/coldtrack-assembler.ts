import { AlertEntity } from '../domain/model/alert.entity';
import { SensorEntity } from '../domain/model/sensor.entity';
import { ShipmentEntity } from '../domain/model/shipment.entity';
import { UserEntity } from '../../iam/domain/model/user.entity';
import { AlertResponse, SensorResponse, ShipmentResponse, UserResponse } from './responses';

/**
 * @summary Maps backend DTOs into ColdTrack domain entities.
 * @author HackRats
 */
export class ColdtrackAssembler {
  /**
   * Converts a user response into a user entity.
   * @param response - Raw API user response.
   * @returns User entity.
   */
  static toUserEntity(response: UserResponse): UserEntity {
    return {
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      roles: response.roles.map(role => role.replace(/^ROLE_/, '') as UserEntity['roles'][number])
    };
  }

  /**
   * Converts shipment responses into shipment entities.
   * @param responses - Raw API shipment responses.
   * @returns Shipment entities.
   */
  static toShipmentEntities(responses: ShipmentResponse[]): ShipmentEntity[] {
    return responses.map(response => ({ ...response }));
  }

  /**
   * Converts sensor responses into sensor entities.
   * @param responses - Raw API sensor responses.
   * @returns Sensor entities.
   */
  static toSensorEntities(responses: SensorResponse[]): SensorEntity[] {
    return responses.map(response => ({ ...response }));
  }

  /**
   * Converts alert responses into alert entities.
   * @param responses - Raw API alert responses.
   * @returns Alert entities.
   */
  static toAlertEntities(responses: AlertResponse[]): AlertEntity[] {
    return responses.map(response => ({ ...response }));
  }
}
