import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserEntity } from '../../iam/domain/model/user.entity';
import { AlertResponse, SensorResponse, ShipmentResponse, UserResponse } from './responses';
import { ColdtrackAssembler } from './coldtrack-assembler';
import { AlertEntity } from '../domain/model/alert.entity';
import { SensorEntity } from '../domain/model/sensor.entity';
import { ShipmentEntity } from '../domain/model/shipment.entity';
import { CreateSensorRequest, CreateShipmentRequest, CreateUserRequest } from './requests';

/**
 * @summary HttpClient-backed resource facade for ColdTrack fake API endpoints.
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
  findUsersByCredentials(email: string, password: string): Observable<UserEntity[]> {
    const params = new HttpParams().set('email', email).set('password', password);
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`, { params })
      .pipe(map(users => users.map(ColdtrackAssembler.toUserEntity)));
  }

  /**
   * Persists a new user in the fake API.
   * @param request - User creation payload.
   * @returns Created user entity.
   */
  createUser(request: CreateUserRequest): Observable<UserEntity> {
    return this.http.post<UserResponse>(`${this.baseUrl}/users`, request)
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
    const id = `ENV-${Date.now().toString().slice(-3)}`;
    const payload: ShipmentEntity = {
      id,
      ...request,
      status: 'PENDING',
      temperature: null,
      humidity: null
    };
    return this.http.post<ShipmentResponse>(`${this.baseUrl}/shipments`, payload);
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
    const payload: SensorEntity = {
      id: request.id,
      status: 'AVAILABLE',
      assignedShipmentId: null,
      lastReadingAt: null,
      temperature: null,
      humidity: null
    };
    return this.http.post<SensorResponse>(`${this.baseUrl}/sensors`, payload);
  }

  /**
   * Lists all alerts.
   * @returns Alert entities.
   */
  getAlerts(): Observable<AlertEntity[]> {
    return this.http.get<AlertResponse[]>(`${this.baseUrl}/alerts`)
      .pipe(map(ColdtrackAssembler.toAlertEntities));
  }
}
