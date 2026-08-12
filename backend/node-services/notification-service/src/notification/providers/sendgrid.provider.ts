import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import {
  EmailPayload,
  EmailProvider,
  EmailResponse,
} from './email-provider.interface';

@Injectable()
export class SendGridProvider implements EmailProvider {
  private readonly logger = new Logger(SendGridProvider.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      throw new Error(
        'SENDGRID_API_KEY is not set. Cannot initialise SendGridProvider.',
      );
    }

    sgMail.setApiKey(apiKey);
    this.logger.log('SendGridProvider initialised');
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    const mailData = this.buildMailData(payload);

    try {
      const [response] = await sgMail.send(mailData);

      const messageId =
        (response.headers?.['x-message-id'] as string) ??
        `sg-${Date.now()}`;

      this.logger.log(`Email delivered — messageId: ${messageId}`);

      return {
        messageId,
        status: 'sent',
        statusCode: response.statusCode,
        message: 'Email accepted by SendGrid',
      };
    } catch (err: any) {
      const sgBody = err?.response?.body;
      const detail =
        sgBody?.errors?.[0]?.message ?? err?.message ?? 'Unknown SendGrid error';

      this.logger.error(`SendGrid delivery failed: ${detail}`, err);

      throw new InternalServerErrorException(
        `Email delivery failed: ${detail}`,
      );
    }
  }

  private buildMailData(payload: EmailPayload): MailDataRequired {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@example.com';
    const fromName = process.env.SENDGRID_FROM_NAME ?? 'Notifications';

    const mailData: MailDataRequired = {
      to: payload.to,
      from: { email: fromEmail, name: fromName },
      subject: payload.subject,
      html: payload.html,
    };

    if (payload.text) {
      mailData.text = payload.text;
    }

    if (payload.metadata) {
      mailData.headers = Object.fromEntries(
        Object.entries(payload.metadata).map(([k, v]) => [
          k.startsWith('X-') ? k : `X-${k}`,
          String(v),
        ]),
      );
    }

    return mailData;
  }
}
