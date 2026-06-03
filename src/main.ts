import { NestFactory } from '@nestjs/core';
import type { RequestHandler } from 'express';

/** CJS module; default import compiles to `.default` which is undefined here without `esModuleInterop`. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => RequestHandler;

function logFatal(prefix: string, err: unknown) {
  const detail =
    err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
  process.stderr.write(`${prefix}\n${detail}\n`);
}

process.on('uncaughtException', (error) => {
  logFatal('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logFatal('Unhandled rejection:', reason);
});

async function start() {
  const port = Number(process.env.PORT) || 3000;
  console.log('Boot probe: entrypoint reached');
  console.log('Boot probe:', {
    node: process.version,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasPgHost: Boolean(process.env.PG_HOST),
    hasSmtpHost: Boolean(process.env.SMTP_HOST),
    port,
  });

  console.log('Bootstrap: loading AppModule');
  const { AppModule } = await import('./app.module');
  console.log('Bootstrap: loading swagger, common, winston, logger');
  const [
    { DocumentBuilder, SwaggerModule },
    { ValidationPipe },
    { WinstonModule },
    { winstonConfig },
    { AllExceptionsFilter },
  ] = await Promise.all([
    import('@nestjs/swagger'),
    import('@nestjs/common'),
    import('nest-winston'),
    import('./common/logger/logger'),
    import('./common/logger/ali-expression.logger'),
  ]);
  console.log('Bootstrap: creating Nest application');

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cookieParser());

  const allowedOrigins = [
    'https://00015730-bisp-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

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

  await app.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`),
  );
}

start().catch((error) => {
  logFatal('Application bootstrap failed:', error);
  process.exit(1);
});
