import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  // Si queremos utilizar la entidad, debemos inyectar el repositorio
  constructor(
    @InjectRepository(User) // TypeOrm => tipo de dato que manejará
    private readonly userRepository: Repository<User>, // => tipo de dato que manejará
    // Servicio proporcionado por JWT
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      /**
       * Para encriptar la contraseña se necesita instalar el paquete => npm i bcryp
       * adicional se escogerá el hash de una sola via, que permite encriptar la data
       * y nunca mas desencriptarla
       * STEPS:
       * 1- Extraemos el campo password de la data, desestructuramos el password, y co  el
       * operador ... expres le nombramos la demas data que viene en la request
       *
       * 2- Luego vamos a donde estamos preparando la data para guardar en la BD y guardamos
       * la data el operador ... expres, seguidamente mediante la funcion de bcrypt.hashSync(password, 10)
       * le decimos que a la propiedad password, darle 10 vueltas para el hash
       */

      const { password, ...userData } = createUserDto;

      // Prepara la data para insertar en la BD
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10), // -> Encripta la contraseña
      });

      // Guarda la data previamente preparada en la BD
      await this.userRepository.save(user);

      // Eliminamos de la response la propiedad password por tanto no se mostrará en el cliente
      delete user.password;
      delete user.id;

      return {
        ...user,
        token: this.getJwToken({ id: user.id }),
      };
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid => (email)');
    }

    // compareSync => arg1: contraseña a verificar, arg2: contraseña que tiene el usuario encontrado
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(
        'Credentials are not valid => (password)',
      );
    }

    return {
      ...user,
      token: this.getJwToken({ id: user.id }),
    };
    // TODO: Retornar JWT
  }

  async checkAuthStatus(user: User){
    // En este punto el usuario ya tiene toda la info. Token autorizado con login y demás
    return {
      ...user, //*esparcimos las propiedades del user
      token: this.getJwToken({ id: user.id }), //!-> Generamos un nuevo token
    };



  }

  private getJwToken(payload: JwtPayload) {
    // código síncrono que regresa el JWT
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
