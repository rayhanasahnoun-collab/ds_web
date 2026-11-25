export type CategorieClient = 'STANDARD' | 'FIDELE' | 'VIP';

export interface Client {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  age?: number;
  email: string;
  telephone: string;
  adresse: string;
  numeroPermis: string;
  dateExpirationPermis: string;
  permisExpire?: boolean;
  categorieClient: CategorieClient;
  dateInscription: string;
}

export interface ClientRequest {
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  adresse: string;
  numeroPermis: string;
  dateExpirationPermis: string;
  categorieClient?: CategorieClient;
}

export interface EligibiliteClient {
  clientId: number;
  eligible: boolean;
  age: number;
  ageValide: boolean;
  permisValide: boolean;
  dateExpirationPermis: string;
  categorieClient: CategorieClient;
  motif: string;
}
