export interface JobOffer {
  id: string;
  titre: string;
  employeur: string;
  quartier: string;
  distance: number;
  domaine: string;
  description: string;
  datePosted: string;
  dateDebut: string;
  duree: string;
  budget?: string;
  urgent: boolean;
  whatsapp: string;
  tel: string;
  employeurVerifie: boolean;
  isAd?: boolean;
}

export const MOCK_OFFERS: JobOffer[] = [
  {
    id: 'o1',
    titre: 'Aide cuisinière – temps partiel',
    employeur: 'Mme Claire Fotso',
    quartier: 'Akwa',
    distance: 1.2,
    domaine: 'Cuisine',
    description:
      'Restaurant cherche aide cuisinière pour préparation plats du midi (10h–14h). Expérience en cuisine africaine exigée. Travail propre et rigoureux attendu.',
    datePosted: 'Il y a 2 heures',
    dateDebut: 'Aujourd\'hui',
    duree: '3 mois',
    budget: '45 000 FCFA/mois',
    urgent: true,
    whatsapp: '+237690000001',
    tel: '+237690000001',
    employeurVerifie: true,
  },
  {
    id: 'o2',
    titre: 'Livreur moto – Bonanjo/Akwa',
    employeur: 'ShopCam Express',
    quartier: 'Bonanjo',
    distance: 0.8,
    domaine: 'Livraison',
    description:
      'Nous recrutons livreur(euse) moto pour livraisons e-commerce. Permis moto requis. Zone Bonanjo-Akwa-Deido. Paiement à la livraison ou salaire fixe.',
    datePosted: 'Il y a 5 heures',
    dateDebut: 'Demain',
    duree: '2 semaines',
    budget: '1 500 FCFA/livraison',
    urgent: false,
    whatsapp: '+237690000002',
    tel: '+237690000002',
    employeurVerifie: true,
  },
  {
    id: 'o3',
    titre: 'Peinture appartement – New Bell',
    employeur: 'M. Alioum',
    quartier: 'New Bell',
    distance: 0.3,
    domaine: 'Peinture',
    description:
      'Appartement F4 à peindre entièrement. Fournitures fournies. Travail soigné requis. Démarrage immédiat. Durée estimée 4 jours.',
    datePosted: 'Il y a 1 jour',
    dateDebut: 'Cette semaine',
    duree: '4 jours',
    budget: '80 000 FCFA',
    urgent: false,
    whatsapp: '+237690000003',
    tel: '+237690000003',
    employeurVerifie: false,
  },
  {
    id: 'o4',
    titre: 'Gardien de nuit – Résidence',
    employeur: 'Résidence Le Palmier',
    quartier: 'Bonapriso',
    distance: 2.5,
    domaine: 'Sécurité',
    description:
      'Poste de gardien de nuit (20h–6h) pour résidence de haut standing. Sérieux et discrétion obligatoires. Formation sécurité appréciée.',
    datePosted: 'Il y a 3 heures',
    dateDebut: 'Lundi prochain',
    duree: 'CDI',
    budget: '55 000 FCFA/mois',
    urgent: true,
    whatsapp: '+237690000004',
    tel: '+237690000004',
    employeurVerifie: true,
  },
  {
    id: 'o5',
    titre: 'Cours de maths lycée',
    employeur: 'Famille Biya',
    quartier: 'Bastos',
    distance: 3.8,
    domaine: 'Enseignement',
    description:
      'Cherchons professeur de mathématiques niveau Terminale pour 2 enfants. 3 séances/semaine (1h30). Niveau BAC S souhaité.',
    datePosted: 'Il y a 6 heures',
    dateDebut: 'La semaine prochaine',
    duree: '6 mois',
    budget: '15 000 FCFA/mois',
    urgent: false,
    whatsapp: '+237690000005',
    tel: '+237690000005',
    employeurVerifie: false,
  },
  {
    id: 'o6',
    titre: 'Aide ménagère – 3j/semaine',
    employeur: 'M. Essomba Jean',
    quartier: 'Deido',
    distance: 1.9,
    domaine: 'Ménage',
    description:
      'Cherche aide ménagère pour maison F5. Lundi, mercredi, vendredi 8h–12h. Sérieuse et honnête. Références appréciées.',
    datePosted: 'Il y a 12 heures',
    dateDebut: 'Cette semaine',
    duree: 'Indéterminée',
    budget: '30 000 FCFA/mois',
    urgent: false,
    whatsapp: '+237690000006',
    tel: '+237690000006',
    employeurVerifie: false,
  },
  {
    id: 'o7',
    titre: 'Électricien pour installation',
    employeur: 'Cabinet Nkeng Architectes',
    quartier: 'Akwa-Nord',
    distance: 2.0,
    domaine: 'Électricité',
    description:
      'Installation électrique complète nouveau bureau 200m². Travail propre et conforme aux normes. Devis préalable requis.',
    datePosted: 'Il y a 2 jours',
    dateDebut: 'Dès que possible',
    duree: '1 semaine',
    budget: 'Selon devis',
    urgent: false,
    whatsapp: '+237690000007',
    tel: '+237690000007',
    employeurVerifie: true,
  },
  {
    id: 'o8',
    titre: 'Coiffeuse pour évènement',
    employeur: 'Mme Ngo Mama',
    quartier: 'Makepe',
    distance: 4.1,
    domaine: 'Coiffure',
    description:
      'Mariage prévu samedi prochain. Besoin coiffeuse pour 5 personnes le matin (6h–10h). Tresses et chignons. Matériel fourni.',
    datePosted: 'Il y a 1 heure',
    dateDebut: 'Samedi',
    duree: '1 jour',
    budget: '25 000 FCFA',
    urgent: true,
    whatsapp: '+237690000008',
    tel: '+237690000008',
    employeurVerifie: false,
  },
  {
    id: 'ad1',
    titre: 'Deviens électricien qualifié',
    employeur: 'StartJobs Academy',
    quartier: 'Douala',
    distance: 0,
    domaine: 'Formation',
    description: 'Rejoins notre programme intensif de 3 mois et trouve un emploi garanti dans le BTP. Inscription ouverte !',
    datePosted: 'Sponsorisé',
    dateDebut: 'Prochaine session: Lundi',
    duree: '3 mois',
    budget: 'Formation',
    urgent: false,
    whatsapp: '+237690000000',
    tel: '+237690000000',
    employeurVerifie: true,
    isAd: true,
  }
];
