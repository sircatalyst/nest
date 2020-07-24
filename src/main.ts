import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { createDocument } from './swagger/swagger';
import { LoggerInterceptor } from './middleware/log/responseLogger';
import { HttpExceptionFilter } from './middleware/errorFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerModule.setup('swagger', app, createDocument(app));
  app.useGlobalInterceptors(new LoggerInterceptor());
	app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(3000);
}

bootstrap();
