import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicule, VehiculeRequest, StatutVehicule, CategorieVehicule, Carburant } from '../../models/vehicule.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculeApiService {
  private readonly baseUrl = 'http://localhost:8080/api/vehicules';

  constructor(private http: HttpClient) {}

  getAll(categorie?: CategorieVehicule, carburant?: Carburant, statut?: StatutVehicule, prixMax?: number): Observable<Vehicule[]> {
    let params = new HttpParams();
    if (categorie) params = params.set('categorie', categorie);
    if (carburant) params = params.set('carburant', carburant);
    if (statut) params = params.set('statut', statut);
    if (prixMax) params = params.set('prixMax', prixMax.toString());

    return this.http.get<Vehicule[]>(this.baseUrl, { params });
  }

  getDisponibles(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${this.baseUrl}/disponibles`);
  }

  getById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.baseUrl}/${id}`);
  }

  create(vehicule: VehiculeRequest): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.baseUrl, vehicule);
  }

  update(id: number, vehicule: VehiculeRequest): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.baseUrl}/${id}`, vehicule);
  }

  updateStatut(id: number, statut: StatutVehicule): Observable<Vehicule> {
    return this.http.patch<Vehicule>(`${this.baseUrl}/${id}/statut`, { statut });
  }

  updateKilometrage(id: number, kilometrage: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/kilometrage`, { kilometrage });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
