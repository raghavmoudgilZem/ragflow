import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ForbiddenFilter } from './common/filters/forbidden.filter';
import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';
import { ALLOWED_ORIGINS } from './common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api', { exclude: ['health'] });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ForbiddenFilter());
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  setupSwagger(app);

  const port = process.env.PORT ?? 9407;
  await app.listen(port);
  console.log(`Search Service is running on: http://localhost:${port}`);
}
bootstrap();
