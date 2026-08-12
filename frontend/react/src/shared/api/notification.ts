export const APP_NOTIFICATION_EVENT = 'app-notification';

export interface NotificationPayload {
  message: string;
  description: string;
}

export interface AppNotificationDetail {
  level: 'error';
  message: string;
  description?: string;
}

const dispatchNotification = (detail: AppNotificationDetail): void => {
  window.dispatchEvent(
    new CustomEvent<AppNotificationDetail>(APP_NOTIFICATION_EVENT, { detail }),
  );
};

export const notifyError = (payload: NotificationPayload): void => {
  dispatchNotification({
    level: 'error',
    message: payload.message,
    description: payload.description,
  });
};

export const notifyMessageError = (text: string): void => {
  dispatchNotification({ level: 'error', message: text });
};
