import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    // Ayuda a ver información de los decoradores donde se encuentre
    private readonly reflector: Reflector,
  ) {}

  // Método que implementa de CanActivate
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Obtiene los roles del guard
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    // del contexto cambiamos todo a un http, y luego obtenemos la data de la request
    const req = context.switchToHttp().getRequest();
    // Una vez obtenida la request, podemos extraer el user de la misma
    const user = req.user as User; // as User -> se utilica del tipo User entity

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    // Con este ciclo se valida si el usuario contiene por lo menos 1 de los roles estipulados para ingresar
    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  }
}
