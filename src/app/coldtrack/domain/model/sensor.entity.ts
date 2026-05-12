/**
 * @summary Represents a physical IoT sensor used to track humidity and temperature.
 * @author HackRats
 */
export interface SensorEntity {
  /** Unique sensor identifier. */
  id: string;
  /** Current sensor assignment status. */
  status: SensorStatus;
  /** Shipment id currently linked to the sensor. */
  assignedShipmentId: string | null;
  /** Last reading timestamp. */
  lastReadingAt: string | null;
  /** Last temperature value. */
  temperature: number | null;
  /** Last humidity value. */
  humidity: number | null;
}

/** Sensor states shown in the sensor management view. */
export type SensorStatus = 'ASSIGNED' | 'AVAILABLE';
