import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

async function start() {
  const PORT = process.env.PORT || 3000;
  console.log('Boot probe: entrypoint reached');
  console.log('Boot probe:', {
    node: process.version,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasPgHost: Boolean(process.env.PG_HOST),
    hasSmtpHost: Boolean(process.env.SMTP_HOST),
    port: PORT,
  });

  const [
    { AppModule },
    { DocumentBuilder, SwaggerModule },
    { ValidationPipe },
    { WinstonModule },
    { winstonConfig },
    { AllExceptionsFilter },
  ] = await Promise.all([
    import('./app.module'),
    import('@nestjs/swagger'),
    import('@nestjs/common'),
    import('nest-winston'),
    import('./common/logger/logger'),
    import('./common/logger/ali-expression.logger'),
  ]);

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cookieParser());

  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Add the api bearer token',
    })
    .setTitle('Furnishings')
    .setDescription(
      'Furnishings is an online platform designed to streamline furniture ordering and management. Users can browse a wide range of furnishings, customize their preferences, track orders, manage delivery schedules, and securely store transaction and user data.',
    )
    .setVersion('1.0')
    .addTag('Nestjs, validation, swagger, guard, mongodb')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`),
  );
}

start().catch((error) => {
  console.error('Application bootstrap failed:', error);
  process.exit(1);
});
