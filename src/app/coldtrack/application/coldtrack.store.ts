import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, finalize, map, Observable, switchMap, tap } from 'rxjs';
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
  private readonly loadErrorSignal = signal<string | null>(null);

  /** Current shipment collection. */
  readonly shipments = this.shipmentsSignal.asReadonly();
  /** Current sensor collection. */
  readonly sensors = this.sensorsSignal.asReadonly();
  /** Current alert collection. */
  readonly alerts = this.alertsSignal.asReadonly();
  /** Data loading state. */
  readonly loading = this.loadingSignal.asReadonly();
  /** Last dashboard loading error. */
  readonly loadError = this.loadErrorSignal.asReadonly();
  /** Active shipments. */
  readonly activeShipments = computed(() => this.shipmentsSignal().filter(shipment => shipment.status === 'IN_TRANSIT'));
  /** Completed shipments. */
  readonly completedShipments = computed(() => this.shipmentsSignal().filter(shipment => shipment.status === 'COMPLETED'));
  /** Available sensors. */
  readonly availableSensors = computed(() => this.sensorsSignal().filter(sensor => sensor.status === 'AVAILABLE'));
  /** Shipments that can still receive operational sensor assignments. */
  readonly assignableShipments = computed(() => this.shipmentsSignal()
    .filter(shipment => shipment.status === 'REGISTERED' || shipment.status === 'IN_TRANSIT'));
  /** Active alerts. */
  readonly activeAlerts = computed(() => this.alertsSignal().filter(alert => alert.status === 'ACTIVE'));
  /** Critical alerts. */
  readonly criticalAlerts = computed(() => this.alertsSignal().filter(alert => alert.severity === 'CRITICAL'));

  /** Loads dashboard data from the backend API. */
  load(): void {
    this.loadingSignal.set(true);
    this.loadErrorSignal.set(null);
    forkJoin({
      shipments: this.api.getShipments(),
      sensors: this.api.getSensors(),
      alerts: this.api.getAlerts()
    }).pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: ({ shipments, sensors, alerts }) => {
          this.shipmentsSignal.set(shipments);
          this.sensorsSignal.set(sensors);
          this.alertsSignal.set(alerts);
        },
        error: () => this.loadErrorSignal.set('app.loadError')
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

  /** Assigns a sensor and replaces its local state with the backend response. */
  assignSensor(shipmentCode: string, sensorCode: string): Observable<SensorEntity> {
    return this.api.assignSensor(shipmentCode, sensorCode).pipe(
      tap(updatedSensor => this.sensorsSignal.update(sensors =>
        sensors.map(sensor => sensor.id === updatedSensor.id ? updatedSensor : sensor)))
    );
  }

  /** Unassigns a sensor from its current shipment and updates local state. */
  unassignSensor(sensorCode: string): Observable<SensorEntity> {
    return this.api.unassignSensor(sensorCode).pipe(
      tap(updatedSensor => this.sensorsSignal.update(sensors =>
        sensors.map(sensor => sensor.id === updatedSensor.id ? updatedSensor : sensor)))
    );
  }

  /** Records telemetry and reloads all aggregates affected by alert evaluation. */
  recordTelemetry(sensorCode: string, temperature: number, humidity: number): Observable<void> {
    return this.api.recordTelemetry(sensorCode, temperature, humidity).pipe(
      switchMap(() => forkJoin({
        shipments: this.api.getShipments(),
        sensors: this.api.getSensors(),
        alerts: this.api.getAlerts()
      })),
      tap(({ shipments, sensors, alerts }) => {
        this.shipmentsSignal.set(shipments);
        this.sensorsSignal.set(sensors);
        this.alertsSignal.set(alerts);
      }),
      map(() => undefined)
    );
  }

  /** Starts a registered shipment and updates local state. */
  startShipment(shipmentCode: string): Observable<ShipmentEntity> {
    return this.api.startShipment(shipmentCode).pipe(tap(shipment => this.replaceShipment(shipment)));
  }

  /** Completes an in-transit shipment and updates local state. */
  completeShipment(shipmentCode: string): Observable<ShipmentEntity> {
    return this.api.completeShipment(shipmentCode).pipe(tap(shipment => this.replaceShipment(shipment)));
  }

  /** Marks an alert as acknowledged and updates local state. */
  acknowledgeAlert(alertCode: string): Observable<AlertEntity> {
    return this.api.acknowledgeAlert(alertCode).pipe(tap(alert => this.replaceAlert(alert)));
  }

  /** Marks an alert as resolved and updates local state. */
  resolveAlert(alertCode: string): Observable<AlertEntity> {
    return this.api.resolveAlert(alertCode).pipe(tap(alert => this.replaceAlert(alert)));
  }

  private replaceShipment(updatedShipment: ShipmentEntity): void {
    this.shipmentsSignal.update(shipments => shipments
      .map(shipment => shipment.id === updatedShipment.id ? updatedShipment : shipment));
  }

  private replaceAlert(updatedAlert: AlertEntity): void {
    this.alertsSignal.update(alerts => alerts
      .map(alert => alert.id === updatedAlert.id ? updatedAlert : alert));
  }
}
