import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger =  new Logger('Main');

  // Prefijo para la url --> http://localhost:3000/api/products/
  app.setGlobalPrefix('api');

  // Con este pipe utilizamos el paquete de class-validator y class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      // El validador eliminará el objeto validado de cualquier propiedad que no tenga decoradores.
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Teslo RestFull Api')
    .setDescription('Teslo Shop enpoindts')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT);
  logger.log(`App running in port: ${process.env.PORT}`)
}
bootstrap();
