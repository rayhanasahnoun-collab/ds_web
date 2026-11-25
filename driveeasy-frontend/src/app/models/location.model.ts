import { Client } from './client.model';
import { Vehicule } from './vehicule.model';

export type StatutLocation = 'RESERVEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface LocationItem {
  id: number;
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateRetourEffectif?: string;
  kmDepart?: number;
  kmRetour?: number;
  distanceParcourue?: number;
  prixJournalierApplique: number;
  montantTotal: number;
  penalite: number;
  statut: StatutLocation;
  dateCreation: string;
  nbJoursPrevus: number;
  retardJours: number;
  enRetard: boolean;
  client?: Client;
  vehicule?: Vehicule;
}

export interface LocationRequest {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface SimulationRequest {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface SimulationResult {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
  nbJours: number;
  prixJournalierBase: number;
  categorieClient: string;
  pourcentageRemise: number;
  montantRemise: number;
  montantTotalEstime: number;
  vehiculeDisponible: boolean;
  clientEligible: boolean;
  message: string;
}

export interface DepartRequest {
  kmDepart: number;
}

export interface RetourRequest {
  kmRetour: number;
  dateRetourEffectif: string;
}
