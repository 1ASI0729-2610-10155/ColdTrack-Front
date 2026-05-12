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
  /** User-facing alert message. */
  message: string;
  /** Timestamp when the alert was registered. */
  createdAt: string;
  /** Current measured value. */
  value: string | null;
  /** Business threshold that triggered the alert. */
  threshold: string | null;
}

/** Alert severity values used for filtering. */
export type AlertSeverity = 'CRITICAL' | 'WARNING';

/** Alert resolution values. */
export type AlertStatus = 'ACTIVE' | 'RESOLVED';

/** Alert type values. */
export type AlertType = 'TEMPERATURE' | 'HUMIDITY' | 'CONNECTION';
