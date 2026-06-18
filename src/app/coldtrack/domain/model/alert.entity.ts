/**
 * @summary Represents a cold-chain operational alert.
 * @author HackRats
 */
export interface AlertEntity {
  /** Unique alert code. */
  id: string;
  /** Alert severity. */
  severity: AlertSeverity;
  /** Current alert status. */
  status: AlertStatus;
  /** Alert category. */
  type: AlertType;
  /** Shipment related to the alert. */
  shipmentId: string;
  /** Sensor related to the alert. */
  sensorId: string;
  /** User-facing alert message. */
  message: string;
  /** Timestamp when the alert was registered. */
  createdAt: string;
  /** Current measured value. */
  value: number | null;
  /** Business threshold that triggered the alert. */
  threshold: number | null;
}

/** Alert severity values used for filtering. */
export type AlertSeverity = 'CRITICAL' | 'WARNING';

/** Alert resolution values. */
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

/** Alert type values. */
export type AlertType = 'TEMPERATURE' | 'HUMIDITY' | 'CONNECTION';
