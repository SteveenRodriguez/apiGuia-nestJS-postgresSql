import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeddModule } from './sedd/sedd.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';

@Module({
  imports: [
    // Con esta linea Inyectamos las variables de entorno
    ConfigModule.forRoot(),

    // Configuración de TypeOrm con POSTGTRES DB
    TypeOrmModule.forRoot({
      // Objeto de Configuración para conectar Postgres con NestJS
      type: 'postgres',
      host: process.env.DB_HOST,
      // Como viene de una variable .env formato string lo convertimos en númeo con el signo +
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      // Carga automáticamente las entidades
      autoLoadEntities: true,
      // Cuando se realiza un cambio se sincroniza (En producción no se utiliza False)
      synchronize: true,
    }),

    // Configuración para servir de forma publica la carpeta (public)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    ProductsModule,

    CommonModule,

    SeddModule,

    FilesModule,

    AuthModule,

    MessagesWsModule,
  ],
})
export class AppModule {
  constructor(private datasource: DataSource) {}
}
