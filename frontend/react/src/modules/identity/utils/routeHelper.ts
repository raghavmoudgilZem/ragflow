import { ROUTES } from '@modules/identity/constants/routes';

export const getChatDetailPath = (dialogId: string) => 
  ROUTES.CHAT_DETAIL.replace(':dialogId', dialogId);