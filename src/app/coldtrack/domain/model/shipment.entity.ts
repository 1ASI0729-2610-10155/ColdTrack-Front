/**
 * @summary Represents a cold-chain shipment monitored by ColdTrack.
 * @author HackRats
 */
export interface ShipmentEntity {
  /** Unique shipment code. */
  id: string;
  /** Destination city. */
  destination: string;
  /** Current shipment lifecycle status. */
  status: ShipmentStatus;
  /** Assigned driver name. */
  driver: string;
  /** Cargo description. */
  cargoDescription: string;
  /** Current temperature in Celsius, when available. */
  temperature: number | null;
  /** Current humidity percentage, when available. */
  humidity: number | null;
  /** Departure date and time. */
  departureAt: string;
  /** Estimated arrival date and time. */
  estimatedArrivalAt: string;
}

/** Shipment states used by dashboards and reports. */
export type ShipmentStatus = 'REGISTERED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
