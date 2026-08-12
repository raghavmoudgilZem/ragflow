import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  APP_NOTIFICATION_EVENT,
  notifyError,
  notifyMessageError,
} from './notification';
import type { AppNotificationDetail } from './notification';

describe('notification adapter', () => {
  beforeEach(() => {
    vi.stubGlobal('window', new EventTarget());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('notifyError dispatches an app-notification event with message and description', () => {
    const received: AppNotificationDetail[] = [];
    window.addEventListener(APP_NOTIFICATION_EVENT, (event) => {
      received.push((event as CustomEvent<AppNotificationDetail>).detail);
    });

    notifyError({ message: 'Failed', description: 'Something went wrong' });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      level: 'error',
      message: 'Failed',
      description: 'Something went wrong',
    });
  });

  it('notifyMessageError dispatches an app-notification event with the message only', () => {
    const received: AppNotificationDetail[] = [];
    window.addEventListener(APP_NOTIFICATION_EVENT, (event) => {
      received.push((event as CustomEvent<AppNotificationDetail>).detail);
    });

    notifyMessageError('Payload too large');

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ level: 'error', message: 'Payload too large' });
  });
});
