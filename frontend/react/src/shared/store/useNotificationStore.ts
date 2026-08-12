import { create } from 'zustand';
import { type AlertColor } from '@mui/material';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  showNotification: (message: string, severity?: AlertColor) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'info', // Default state value
  showNotification: (message, severity = 'info') => 
    set({ open: true, message, severity }),
  hideNotification: () => 
    set({ open: false }),
}));
