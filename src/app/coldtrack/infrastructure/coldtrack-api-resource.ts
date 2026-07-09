import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserEntity } from '../../iam/domain/model/user.entity';
import { AlertResponse, AuthenticatedUserResponse, SensorResponse, ShipmentResponse, UserResponse } from './responses';
import { ColdtrackAssembler } from './coldtrack-assembler';
import { AlertEntity } from '../domain/model/alert.entity';
import { SensorEntity } from '../domain/model/sensor.entity';
import { ShipmentEntity } from '../domain/model/shipment.entity';
import { CreateSensorRequest, CreateShipmentRequest, CreateUserRequest } from './requests';

/**
 * @summary HttpClient-backed resource facade for the ColdTrack backend.
 * @author HackRats
 */
@Injectable({ providedIn: 'root' })
export class ColdtrackApiResource {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Finds users matching login credentials.
   * @param email - Login e-mail.
   * @param password - Login password.
   * @returns Users matching both credentials.
   */
  signIn(email: string, password: string): Observable<{ user: UserEntity; token: string; tokenType: string }> {
    return this.http.post<AuthenticatedUserResponse>(`${this.baseUrl}/authentication/sign-in`, { email, password })
      .pipe(map(response => ({
        user: ColdtrackAssembler.toUserEntity(response.user),
        token: response.token,
        tokenType: response.tokenType
      })));
  }

  /**
   * Creates a user in the backend API.
   * @param request - User creation payload.
   * @returns Created user entity.
   */
  signUp(request: CreateUserRequest): Observable<UserEntity> {
    const payload = { ...request, role: `ROLE_${request.role}` };
    return this.http.post<UserResponse>(`${this.baseUrl}/authentication/sign-up`, payload)
      .pipe(map(ColdtrackAssembler.toUserEntity));
  }

  /**
   * Lists all shipments.
   * @returns Shipment entities.
   */
  getShipments(): Observable<ShipmentEntity[]> {
    return this.http.get<ShipmentResponse[]>(`${this.baseUrl}/shipments`)
      .pipe(map(ColdtrackAssembler.toShipmentEntities));
  }

  /**
   * Creates a new shipment.
   * @param request - Shipment creation payload.
   * @returns Created shipment.
   */
  createShipment(request: CreateShipmentRequest): Observable<ShipmentEntity> {
    return this.http.post<ShipmentResponse>(`${this.baseUrl}/shipments`, request)
      .pipe(map(response => ({ ...response })));
  }

  /**
   * Lists all sensors.
   * @returns Sensor entities.
   */
  getSensors(): Observable<SensorEntity[]> {
    return this.http.get<SensorResponse[]>(`${this.baseUrl}/sensors`)
      .pipe(map(ColdtrackAssembler.toSensorEntities));
  }

  /**
   * Creates a new available sensor.
   * @param request - Sensor creation payload.
   * @returns Created sensor.
   */
  createSensor(request: CreateSensorRequest): Observable<SensorEntity> {
    return this.http.post<SensorResponse>(`${this.baseUrl}/sensors`, request)
      .pipe(map(response => ({ ...response })));
  }

  /** Assigns an available sensor to an existing shipment. */
  assignSensor(shipmentCode: string, sensorCode: string): Observable<SensorEntity> {
    return this.http.post<SensorResponse>(
      `${this.baseUrl}/shipments/${encodeURIComponent(shipmentCode)}/sensor-assignments`,
      { sensorCode }
    ).pipe(map(response => ({ ...response })));
  }

  /** Removes the current shipment assignment from a sensor. */
  unassignSensor(sensorCode: string): Observable<SensorEntity> {
    return this.http.delete<SensorResponse>(
      `${this.baseUrl}/sensors/${encodeURIComponent(sensorCode)}/assignment`
    ).pipe(map(response => ({ ...response })));
  }

  /** Records a telemetry reading for an assigned sensor. */
  recordTelemetry(sensorCode: string, temperature: number, humidity: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/telemetry-readings`, {
      sensorCode,
      temperature,
      humidity,
      recordedAt: new Date().toISOString()
    });
  }

  /** Moves a registered shipment into transit. */
  startShipment(shipmentCode: string): Observable<ShipmentEntity> {
    return this.http.post<ShipmentResponse>(
      `${this.baseUrl}/shipments/${encodeURIComponent(shipmentCode)}/departures`, {})
      .pipe(map(response => ({ ...response })));
  }

  /** Completes an in-transit shipment. */
  completeShipment(shipmentCode: string): Observable<ShipmentEntity> {
    return this.http.post<ShipmentResponse>(
      `${this.baseUrl}/shipments/${encodeURIComponent(shipmentCode)}/completions`, {})
      .pipe(map(response => ({ ...response })));
  }

  /**
   * Lists all alerts.
   * @returns Alert entities.
   */
  getAlerts(): Observable<AlertEntity[]> {
    return this.http.get<AlertResponse[]>(`${this.baseUrl}/alerts`)
      .pipe(map(ColdtrackAssembler.toAlertEntities));
  }

  /** Marks an active alert as acknowledged. */
  acknowledgeAlert(alertCode: string): Observable<AlertEntity> {
    return this.http.post<AlertResponse>(
      `${this.baseUrl}/alerts/${encodeURIComponent(alertCode)}/acknowledgements`, {}
    ).pipe(map(response => ({ ...response })));
  }

  /** Marks an active or acknowledged alert as resolved. */
  resolveAlert(alertCode: string): Observable<AlertEntity> {
    return this.http.post<AlertResponse>(
      `${this.baseUrl}/alerts/${encodeURIComponent(alertCode)}/resolutions`, {}
    ).pipe(map(response => ({ ...response })));
  }
}
