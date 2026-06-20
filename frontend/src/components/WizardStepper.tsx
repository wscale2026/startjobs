import React from 'react';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';

const STEP_LABELS = [
  'Identité',
  'Compétences',
  'Formation',
  'Disponibilité',
  'Atouts',
];

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
}

export default function WizardStepper({ currentStep, totalSteps }: WizardStepperProps) {
  const theme = useTheme();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          Étape {currentStep + 1} sur {totalSteps}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {STEP_LABELS[currentStep]}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 4,
          bgcolor: theme.palette.action.selected,
          '& .MuiLinearProgress-bar': { borderRadius: 4 },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {STEP_LABELS.map((label, i) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: i <= currentStep ? 'primary.main' : 'divider',
                transition: 'background-color 0.3s',
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
