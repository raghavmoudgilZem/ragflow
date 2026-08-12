import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '@shared/store/useNotificationStore';

export function NotificationToast() {
    const { open, message, severity, hideNotification } = useNotificationStore();

    return (
        <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={hideNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                onClose={hideNotification}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
