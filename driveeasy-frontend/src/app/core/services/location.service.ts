import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LocationItem,
  LocationRequest,
  SimulationRequest,
  SimulationResult,
  DepartRequest,
  RetourRequest,
  StatutLocation
} from '../../models/location.model';
import { Statistiques } from '../../models/statistiques.model';

@Injectable({
  providedIn: 'root'
})
export class LocationApiService {
  private readonly baseUrl = 'http://localhost:8080/api/locations';

  constructor(private http: HttpClient) {}

  getAll(statut?: StatutLocation, clientId?: number, vehiculeId?: number, dateDebut?: string, dateFin?: string): Observable<LocationItem[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (clientId) params = params.set('clientId', clientId.toString());
    if (vehiculeId) params = params.set('vehiculeId', vehiculeId.toString());
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<LocationItem[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<LocationItem> {
    return this.http.get<LocationItem>(`${this.baseUrl}/${id}`);
  }

  simulerTarif(request: SimulationRequest): Observable<SimulationResult> {
    return this.http.post<SimulationResult>(`${this.baseUrl}/simulation`, request);
  }

  createReservation(request: LocationRequest): Observable<LocationItem> {
    return this.http.post<LocationItem>(this.baseUrl, request);
  }

  demarrerLocation(id: number, request: DepartRequest): Observable<LocationItem> {
    return this.http.patch<LocationItem>(`${this.baseUrl}/${id}/depart`, request);
  }

  retourVehicule(id: number, request: RetourRequest): Observable<LocationItem> {
    return this.http.patch<LocationItem>(`${this.baseUrl}/${id}/retour`, request);
  }

  annulerReservation(id: number): Observable<LocationItem> {
    return this.http.patch<LocationItem>(`${this.baseUrl}/${id}/annulation`, {});
  }

  getStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.baseUrl}/statistiques`);
  }
}
