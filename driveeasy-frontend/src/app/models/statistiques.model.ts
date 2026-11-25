export interface Statistiques {
  totalLocations: number;
  reservationsActives: number;
  locationsEnCours: number;
  locationsTerminees: number;
  locationsAnnulees: number;
  chiffreAffairesTotal: number;
  chiffreAffairesMoisCourant: number;
  montantPenalitesTotal: number;
  tauxOccupationPourcentage: number;
  repartitionParStatut: { [key: string]: number };
  topVehiculesLoues: { [key: string]: number };
}
