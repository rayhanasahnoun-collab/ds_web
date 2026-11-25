export type StatutVehicule = 'DISPONIBLE' | 'LOUE' | 'MAINTENANCE';
export type CategorieVehicule = 'CITADINE' | 'BERLINE' | 'SUV' | 'UTILITAIRE' | 'LUXE';
export type Carburant = 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';
export type BoiteVitesse = 'MANUELLE' | 'AUTOMATIQUE';

export interface Vehicule {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  categorie: CategorieVehicule;
  carburant: Carburant;
  boite: BoiteVitesse;
  nbPlaces: number;
  kilometrage: number;
  prixJournalier: number;
  statut: StatutVehicule;
  imageUrl?: string;
}

export interface VehiculeRequest {
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  categorie: CategorieVehicule;
  carburant: Carburant;
  boite: BoiteVitesse;
  nbPlaces: number;
  kilometrage: number;
  prixJournalier: number;
  statut?: StatutVehicule;
  imageUrl?: string;
}
