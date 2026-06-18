import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { AlertEntity } from '../domain/model/alert.entity';
import { SensorEntity } from '../domain/model/sensor.entity';
import { ShipmentEntity } from '../domain/model/shipment.entity';
import { ColdtrackApiResource } from '../infrastructure/coldtrack-api-resource';
import { CreateSensorRequest, CreateShipmentRequest } from '../infrastructure/requests';

/**
 * @summary Signal-based state manager for ColdTrack operational data.
 * @author HackRats
 */
@Injectable({ providedIn: 'root' })
export class ColdtrackStore {
  private readonly api = inject(ColdtrackApiResource);
  private readonly shipmentsSignal = signal<ShipmentEntity[]>([]);
  private readonly sensorsSignal = signal<SensorEntity[]>([]);
  private readonly alertsSignal = signal<AlertEntity[]>([]);
  private readonly loadingSignal = signal(false);

  /** Current shipment collection. */
  readonly shipments = this.shipmentsSignal.asReadonly();
  /** Current sensor collection. */
  readonly sensors = this.sensorsSignal.asReadonly();
  /** Current alert collection. */
  readonly alerts = this.alertsSignal.asReadonly();
  /** Data loading state. */
  readonly loading = this.loadingSignal.asReadonly();
  /** Active shipments. */
  readonly activeShipments = computed(() => this.shipmentsSignal().filter(shipment => shipment.status === 'IN_TRANSIT'));
  /** Completed shipments. */
  readonly completedShipments = computed(() => this.shipmentsSignal().filter(shipment => shipment.status === 'COMPLETED'));
  /** Available sensors. */
  readonly availableSensors = computed(() => this.sensorsSignal().filter(sensor => sensor.status === 'AVAILABLE'));
  /** Active alerts. */
  readonly activeAlerts = computed(() => this.alertsSignal().filter(alert => alert.status === 'ACTIVE'));
  /** Critical alerts. */
  readonly criticalAlerts = computed(() => this.alertsSignal().filter(alert => alert.severity === 'CRITICAL'));

  /** Loads dashboard data from the backend API. */
  load(): void {
    this.loadingSignal.set(true);
    forkJoin({
      shipments: this.api.getShipments(),
      sensors: this.api.getSensors(),
      alerts: this.api.getAlerts()
    }).pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe(({ shipments, sensors, alerts }) => {
        this.shipmentsSignal.set(shipments);
        this.sensorsSignal.set(sensors);
        this.alertsSignal.set(alerts);
      });
  }

  /**
   * Creates a shipment and updates local signal state.
   * @param request - New shipment request.
   */
  createShipment(request: CreateShipmentRequest): void {
    this.api.createShipment(request).subscribe(shipment => {
      this.shipmentsSignal.update(shipments => [shipment, ...shipments]);
    });
  }

  /**
   * Creates a sensor and updates local signal state.
   * @param request - New sensor request.
   */
  createSensor(request: CreateSensorRequest): void {
    this.api.createSensor(request).subscribe(sensor => {
      this.sensorsSignal.update(sensors => [sensor, ...sensors]);
    });
  }
}
