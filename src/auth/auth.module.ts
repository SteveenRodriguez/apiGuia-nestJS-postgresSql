import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,

    /**
     * Se le salio la mierda opues veo que arranca como que bien esta monda me gusta no 
     * se que tal quede
     * 
     */

    // aqui importamos las entidades que creamos de nuestro módulo
    TypeOrmModule.forFeature([User]),

    // COnfiguración para Passport con JWT y seleccionamos el tipo de estrategia
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configuración del Módulo de JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log(configService.get('JWT_SECRET'))
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),

    //#yellow
    // JwtModule.register({ MÓDULO SINCRONO
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h',
    //   },
    // }),
    //#
  ],
  // Aquí exportamos el modulo para poder utilizar las entidades
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
