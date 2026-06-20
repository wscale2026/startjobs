import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WizardExperience {
  id: string;
  titre: string;
  employeur: string;
  annee: string;
}

interface WizardData {
  // Step 1 – Identity
  photo: string;
  photoFile?: any;
  photoPreview?: string;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  dateNaissance: string;
  ville: string;
  quartier: string;
  latitude?: number;
  longitude?: number;
  typeProfil: string; // Salarié, Freelance, Apprenti
  // Step 2 – Skills
  domaines: string[];
  sousCompetences: string[];
  // Step 3 – Education
  diplome: string;
  etablissement: string;
  annee: string;
  // Step 4 – Experiences
  experiences: WizardExperience[];
  // Step 5 – Availability
  disponibilites: string[];
  rayon: number;
  // Step 6 – Assets
  bio: string;
  langues: string[];
  permis: boolean;
}

interface WizardState {
  currentStep: number;
  totalSteps: number;
  data: Partial<WizardData>;
  completed: boolean;
}

const initialState: WizardState = {
  currentStep: 0,
  totalSteps: 6,
  data: {
    experiences: [],
  },
  completed: false,
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps - 1) state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 0) state.currentStep -= 1;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateData: (state, action: PayloadAction<Partial<WizardData>>) => {
      state.data = { ...state.data, ...action.payload };
    },
    completeWizard: (state) => { state.completed = true; },
    resetWizard: () => initialState,
  },
});

export const { nextStep, prevStep, goToStep, updateData, completeWizard, resetWizard } = wizardSlice.actions;
export default wizardSlice.reducer;
