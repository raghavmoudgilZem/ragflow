export default () => ({
  app: {
    name: 'file-service',
    port: Number(process.env.PORT ?? 4005),
    environment: process.env.NODE_ENV ?? 'development',
  },

  database: {
    url: process.env.DATABASE_URL_FILE,
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
  },

  storage: {
    defaultProvider: process.env.DEFAULT_STORAGE_PROVIDER ?? 'LOCAL',

    local: {
      storagePath: process.env.LOCAL_STORAGE_PATH ?? './storage',
    },
    minio: {
      endpoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      bucket: process.env.MINIO_BUCKET,
    },
    s3: {
      bucket: process.env.S3_BUCKET,
    },
  },
});
