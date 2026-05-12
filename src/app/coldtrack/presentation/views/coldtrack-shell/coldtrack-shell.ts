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

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['test@test.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required]
  });

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['LOGISTICS_ADMIN' as UserRole, Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
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
    id: ['', Validators.required]
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

  /** Submits the sign-up form and creates a new fake API user. */
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
}
