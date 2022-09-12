import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      // Se tiene la varinale de entorno que contiene la secret key
      secretOrKey: configService.get('JWT_SECRET'),

      // le decimos de donde quiero que venga el jwt en la request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // extraemos el email del Payload
    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if(!user){
        throw new UnauthorizedException('Token No Valid');
    }

    if(!user.isActive){
        throw new UnauthorizedException('User is inactive, talk with an admin');
    }

    // Si llega a este punto, lo que se retorne se agg a la request
    return user;
  }
}
