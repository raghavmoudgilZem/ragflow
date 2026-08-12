import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().required(),

  DATABASE_URL_FILE: Joi.string().required(),

  SWAGGER_ENABLED: Joi.boolean().default(true),

  DEFAULT_STORAGE_PROVIDER: Joi.string()
    .valid('LOCAL', 'MINIO', 'S3')
    .default('LOCAL'),

  LOCAL_STORAGE_PATH: Joi.string().default('./storage'),

  MINIO_ENDPOINT: Joi.string().required(),

  MINIO_PORT: Joi.number().required(),

  MINIO_USE_SSL: Joi.boolean().default(false),

  MINIO_ACCESS_KEY: Joi.string().required(),

  MINIO_SECRET_KEY: Joi.string().required(),

  MINIO_BUCKET: Joi.string().required(),
});
