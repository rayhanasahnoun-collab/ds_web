import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientRequest, EligibiliteClient, CategorieClient } from '../../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientApiService {
  private readonly baseUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<Client[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  getEligibilite(id: number): Observable<EligibiliteClient> {
    return this.http.get<EligibiliteClient>(`${this.baseUrl}/${id}/eligibilite`);
  }

  create(client: ClientRequest): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  update(id: number, client: ClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client);
  }

  updateCategorie(id: number, categorie: CategorieClient): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/${id}/categorie`, { categorie });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
