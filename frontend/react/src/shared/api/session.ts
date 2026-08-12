import { removeAll, redirectToLogin } from '@shared/utils/authorization';
import { notifyError } from './notification';

let sessionExpiryHandled = false;

export const handleSessionExpired = (message?: string): void => {
  if (sessionExpiryHandled) {
    return;
  }
  sessionExpiryHandled = true;
  removeAll();
  if (message) {
    notifyError({ message, description: message });
  }
  redirectToLogin();
};

export const resetSessionExpiry = (): void => {
  sessionExpiryHandled = false;
};
