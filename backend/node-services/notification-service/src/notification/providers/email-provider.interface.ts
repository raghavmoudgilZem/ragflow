export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, string>;
}

export interface EmailResponse {
  messageId: string;
  status: 'sent' | 'failed';
  statusCode: number;
  message?: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<EmailResponse>;
}
