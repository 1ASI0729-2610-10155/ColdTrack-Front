import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthStore } from '../../../../iam/application/auth.store';
import { ColdtrackStore } from '../../../application/coldtrack.store';
import { ShipmentEntity, ShipmentStatus } from '../../../domain/model/shipment.entity';
import { SensorEntity } from '../../../domain/model/sensor.entity';
import { AlertEntity, AlertSeverity, AlertStatus } from '../../../domain/model/alert.entity';
import { UserRole } from '../../../../iam/domain/model/user.entity';
import { finalize } from 'rxjs';

type ShellView = 'dashboard' | 'new-shipment' | 'sensors' | 'alerts' | 'history';
type AuthMode = 'sign-in' | 'sign-up';

/**
 * @summary Main ColdTrack shell with authentication, navigation and operational views.
 * @author HackRats
 */
@Component({
  selector: 'app-coldtrack-shell',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule
  ],
  templateUrl: './coldtrack-shell.html',
  styleUrl: './coldtrack-shell.css'
})
export class ColdtrackShell {
  protected readonly authStore = inject(AuthStore);
  protected readonly store = inject(ColdtrackStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  protected readonly authMode = signal<AuthMode>('sign-in');
  protected readonly currentView = signal<ShellView>('dashboard');
  protected readonly currentLanguage = signal(this.translate.getCurrentLang() || 'en');
  protected readonly shipmentSearch = signal('');
  protected readonly sensorSearch = signal('');
  protected readonly alertSearch = signal('');
  protected readonly historySearch = signal('');
  protected readonly selectedSeverity = signal<'ALL' | AlertSeverity>('ALL');
  protected readonly selectedAlertStatus = signal<'ALL' | AlertStatus>('ALL');
  protected readonly detailShipment = signal<ShipmentEntity | null>(null);
  protected readonly linkingSensor = signal<SensorEntity | null>(null);
  protected readonly assignmentLoading = signal(false);
  protected readonly assignmentError = signal<string | null>(null);
  protected readonly assignmentSuccess = signal<string | null>(null);
  protected readonly telemetrySensor = signal<SensorEntity | null>(null);
  protected readonly telemetryLoading = signal(false);
  protected readonly telemetryError = signal<string | null>(null);
  protected readonly telemetrySuccess = signal<string | null>(null);
  protected readonly lifecycleLoading = signal(false);
  protected readonly lifecycleError = signal<string | null>(null);
  protected readonly lifecycleSuccess = signal<string | null>(null);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['test@test.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required]
  });

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['LOGISTICS_ADMIN' as UserRole, Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  protected readonly shipmentForm = this.formBuilder.nonNullable.group({
    destination: ['', Validators.required],
    driver: ['', Validators.required],
    cargoDescription: ['', Validators.required],
    departureAt: ['', Validators.required],
    estimatedArrivalAt: ['', Validators.required]
  });

  protected readonly sensorForm = this.formBuilder.nonNullable.group({
    id: ['', [Validators.required, Validators.pattern(/^SENS-[A-Za-z0-9-]+$/)]]
  });

  protected readonly assignmentForm = this.formBuilder.nonNullable.group({
    shipmentCode: ['', Validators.required]
  });

  protected readonly telemetryForm = this.formBuilder.nonNullable.group({
    temperature: [4, [Validators.required, Validators.min(-50), Validators.max(100)]],
    humidity: [50, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  protected readonly navigationItems = signal([
    { view: 'dashboard' as ShellView, icon: 'dashboard', label: 'navigation.dashboard' },
    { view: 'new-shipment' as ShellView, icon: 'add', label: 'navigation.newShipment' },
    { view: 'sensors' as ShellView, icon: 'device_thermostat', label: 'navigation.sensors' },
    { view: 'alerts' as ShellView, icon: 'notifications', label: 'navigation.alerts' },
    { view: 'history' as ShellView, icon: 'history', label: 'navigation.history' }
  ]);

  protected readonly drivers = signal(['Carlos Ruiz', 'Ana Garcia', 'Luis Mendoza', 'Maria Torres']);

  protected readonly filteredShipments = computed(() => {
    const query = this.shipmentSearch().toLowerCase();
    return this.store.shipments().filter(shipment => this.matchesShipment(shipment, query));
  });

  protected readonly filteredSensors = computed(() => {
    const query = this.sensorSearch().toLowerCase();
    return this.store.sensors().filter(sensor => this.matchesSensor(sensor, query));
  });

  protected readonly filteredAlerts = computed(() => {
    const query = this.alertSearch().toLowerCase();
    return this.store.alerts().filter(alert => {
      const matchesQuery = `${alert.id} ${alert.shipmentId} ${alert.message}`.toLowerCase().includes(query);
      const matchesSeverity = this.selectedSeverity() === 'ALL' || alert.severity === this.selectedSeverity();
      const matchesStatus = this.selectedAlertStatus() === 'ALL' || alert.status === this.selectedAlertStatus();
      return matchesQuery && matchesSeverity && matchesStatus;
    });
  });

  protected readonly filteredHistory = computed(() => {
    const query = this.historySearch().toLowerCase();
    return this.store.completedShipments().filter(shipment => this.matchesShipment(shipment, query));
  });

  protected readonly averageTemperature = computed(() => {
    const values = this.store.completedShipments()
      .map(shipment => shipment.temperature)
      .filter((value): value is number => value !== null);
    if (values.length === 0) {
      return '0.0';
    }
    return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
  });

  protected readonly detailSensor = computed(() => {
    const shipment = this.detailShipment();
    return shipment ? this.store.sensors().find(sensor => sensor.assignedShipmentId === shipment.id) ?? null : null;
  });

  protected readonly detailAlerts = computed(() => {
    const shipment = this.detailShipment();
    return shipment ? this.store.alerts().filter(alert => alert.shipmentId === shipment.id) : [];
  });

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.store.load();
      }
    });
  }

  /**
   * Changes the application language.
   * @param language - Language code selected by the user.
   */
  protected useLanguage(language: string): void {
    this.translate.use(language);
    this.currentLanguage.set(language);
  }

  /** Submits the sign-in form. */
  protected signIn(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.authStore.signIn(this.loginForm.controls.email.value, this.loginForm.controls.password.value);
  }

  /** Submits the sign-up form and creates a new backend user. */
  protected signUp(): void {
    if (this.registerForm.invalid || this.registerForm.controls.password.value !== this.registerForm.controls.confirmPassword.value) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { fullName, email, role, password } = this.registerForm.getRawValue();
    this.authStore.signUp({ fullName, email, role, password });
  }

  /** Ends the session and returns the user to sign in. */
  protected signOut(): void {
    this.authStore.signOut();
    this.authMode.set('sign-in');
    this.currentView.set('dashboard');
  }

  /**
   * Updates the selected application view.
   * @param view - Shell view to activate.
   */
  protected setView(view: ShellView): void {
    this.currentView.set(view);
  }

  /** Creates a new shipment from the form. */
  protected createShipment(): void {
    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }
    this.store.createShipment(this.shipmentForm.getRawValue());
    this.shipmentForm.reset();
    this.currentView.set('dashboard');
  }

  /** Creates a new available sensor from the inline form. */
  protected createSensor(): void {
    if (this.sensorForm.invalid) {
      this.sensorForm.markAllAsTouched();
      return;
    }
    this.store.createSensor(this.sensorForm.getRawValue());
    this.sensorForm.reset();
  }

  /** Opens the shipment details dialog. */
  protected showShipmentDetails(shipment: ShipmentEntity): void {
    this.detailShipment.set(shipment);
    this.lifecycleError.set(null);
    this.lifecycleSuccess.set(null);
  }

  /** Opens the sensor assignment dialog. */
  protected openSensorAssignment(sensor: SensorEntity): void {
    this.linkingSensor.set(sensor);
    this.assignmentForm.reset();
    this.assignmentError.set(null);
  }

  /** Closes the sensor assignment dialog. */
  protected closeSensorAssignment(): void {
    this.linkingSensor.set(null);
    this.assignmentForm.reset();
    this.assignmentError.set(null);
  }

  /** Opens the telemetry form for an assigned sensor. */
  protected openTelemetry(sensor: SensorEntity): void {
    this.telemetrySensor.set(sensor);
    this.telemetryForm.reset({
      temperature: sensor.temperature ?? 4,
      humidity: sensor.humidity ?? 50
    });
    this.telemetryError.set(null);
  }

  /** Closes the telemetry form. */
  protected closeTelemetry(): void {
    this.telemetrySensor.set(null);
    this.telemetryError.set(null);
  }

  /** Records an environmental reading for the selected sensor. */
  protected recordTelemetry(): void {
    const sensor = this.telemetrySensor();
    if (!sensor || this.telemetryForm.invalid) {
      this.telemetryForm.markAllAsTouched();
      return;
    }

    const { temperature, humidity } = this.telemetryForm.getRawValue();
    this.telemetryLoading.set(true);
    this.telemetryError.set(null);
    this.store.recordTelemetry(sensor.id, temperature, humidity)
      .pipe(finalize(() => this.telemetryLoading.set(false)))
      .subscribe({
        next: () => {
          this.telemetrySuccess.set(sensor.id);
          this.closeTelemetry();
        },
        error: () => this.telemetryError.set('sensors.telemetryError')
      });
  }

  /** Advances a shipment through its required lifecycle state. */
  protected advanceShipment(): void {
    const shipment = this.detailShipment();
    if (!shipment || (shipment.status !== 'REGISTERED' && shipment.status !== 'IN_TRANSIT')) {
      return;
    }

    this.lifecycleLoading.set(true);
    this.lifecycleError.set(null);
    const operation = shipment.status === 'REGISTERED'
      ? this.store.startShipment(shipment.id)
      : this.store.completeShipment(shipment.id);
    operation.pipe(finalize(() => this.lifecycleLoading.set(false)))
      .subscribe({
        next: updatedShipment => {
          this.detailShipment.set(updatedShipment);
          this.lifecycleSuccess.set(updatedShipment.status === 'IN_TRANSIT'
            ? 'shipment.startedSuccess'
            : 'shipment.completedSuccess');
        },
        error: () => this.lifecycleError.set('shipment.lifecycleError')
      });
  }

  /** Returns the shipment currently linked to a sensor. */
  protected shipmentForSensor(sensor: SensorEntity): ShipmentEntity | null {
    return sensor.assignedShipmentId
      ? this.store.shipments().find(shipment => shipment.id === sensor.assignedShipmentId) ?? null
      : null;
  }

  /** Assigns the selected sensor to the selected shipment. */
  protected assignSensor(): void {
    const sensor = this.linkingSensor();
    if (!sensor || this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.assignmentLoading.set(true);
    this.assignmentError.set(null);
    const shipmentCode = this.assignmentForm.controls.shipmentCode.value;
    this.store.assignSensor(shipmentCode, sensor.id)
      .pipe(finalize(() => this.assignmentLoading.set(false)))
      .subscribe({
        next: () => {
          this.assignmentSuccess.set(`${sensor.id} → ${shipmentCode}`);
          this.closeSensorAssignment();
        },
        error: () => this.assignmentError.set('sensors.assignmentError')
      });
  }

  /** Exports all currently loaded shipments as an Excel-compatible CSV file. */
  protected exportShipments(): void {
    this.downloadCsv('coldtrack-shipments',
      ['ID', 'Destination', 'Status', 'Driver', 'Cargo', 'Temperature', 'Humidity', 'Departure', 'Estimated arrival'],
      this.store.shipments().map(shipment => [shipment.id, shipment.destination, shipment.status, shipment.driver,
        shipment.cargoDescription, shipment.temperature, shipment.humidity, shipment.departureAt, shipment.estimatedArrivalAt]));
  }

  /** Exports the currently filtered alerts as CSV. */
  protected exportAlerts(): void {
    this.downloadCsv('coldtrack-alerts',
      ['ID', 'Severity', 'Status', 'Type', 'Shipment', 'Sensor', 'Message', 'Created at', 'Value', 'Threshold'],
      this.filteredAlerts().map(alert => [alert.id, alert.severity, alert.status, alert.type, alert.shipmentId,
        alert.sensorId, alert.message, alert.createdAt, alert.value, alert.threshold]));
  }

  /** Exports the currently filtered completed shipment history as CSV. */
  protected exportHistory(): void {
    this.downloadCsv('coldtrack-history',
      ['ID', 'Destination', 'Driver', 'Cargo', 'Departure', 'Arrival', 'Temperature', 'Humidity'],
      this.filteredHistory().map(shipment => [shipment.id, shipment.destination, shipment.driver,
        shipment.cargoDescription, shipment.departureAt, shipment.estimatedArrivalAt,
        shipment.temperature, shipment.humidity]));
  }

  /**
   * Returns the translation key for a shipment status.
   * @param status - Shipment status.
   * @returns Translation key.
   */
  protected shipmentStatusKey(status: ShipmentStatus): string {
    return `status.shipment.${status}`;
  }

  /**
   * Returns whether a shipment status is highlighted as successful.
   * @param status - Shipment status to inspect.
   * @returns True when the status is completed.
   */
  protected isCompleted(status: ShipmentStatus): boolean {
    return status === 'COMPLETED';
  }

  /**
   * Tracks table rows by entity id.
   * @param _index - Angular row index.
   * @param item - Row item.
   * @returns Stable id.
   */
  protected trackById(_index: number, item: ShipmentEntity | SensorEntity | AlertEntity): string {
    return item.id;
  }

  private matchesShipment(shipment: ShipmentEntity, query: string): boolean {
    return `${shipment.id} ${shipment.destination} ${shipment.driver} ${shipment.cargoDescription}`.toLowerCase().includes(query);
  }

  private matchesSensor(sensor: SensorEntity, query: string): boolean {
    return `${sensor.id} ${sensor.assignedShipmentId ?? ''}`.toLowerCase().includes(query);
  }

  private downloadCsv(filename: string, headers: string[], rows: unknown[][]): void {
    const content = [headers, ...rows]
      .map(row => row.map(value => this.toCsvCell(value)).join(','))
      .join('\r\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private toCsvCell(value: unknown): string {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }
}
