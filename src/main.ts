import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { createDocument } from './swagger/swagger';
import { LoggerInterceptor } from './middleware/Logs/responseLogger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerModule.setup('swagger', app, createDocument(app));
  app.useGlobalInterceptors(new LoggerInterceptor());
  await app.listen(3000);
}

bootstrap();
