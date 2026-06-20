import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { dismissSnackbar } from '../store/slices/snackbarSlice';

export default function SnackbarProvider() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector((s) => s.snackbar.queue);
  const current = queue[0] ?? null;

  return current ? (
    <Snackbar
      key={current.id}
      open
      autoHideDuration={4000}
      onClose={() => dispatch(dismissSnackbar(current.id))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 9 }}
    >
      <Alert
        severity={current.severity}
        onClose={() => dispatch(dismissSnackbar(current.id))}
        sx={{ width: '100%', borderRadius: 3 }}
      >
        {current.message}
      </Alert>
    </Snackbar>
  ) : null;
}
