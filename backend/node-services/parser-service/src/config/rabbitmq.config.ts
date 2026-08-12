import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBIT_MQ_URL,
  queue: {
    documentCreated: 'document-created',
  },
}));
