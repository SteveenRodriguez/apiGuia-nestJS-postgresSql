import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // del contexto cambiamos todo a un http, y luego obtenemos la data de la request
    const req = ctx.switchToHttp().getRequest();
    // Una vez obtenida la request, podemos extraer el user de la misma
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }

    return !data ? user : user[data];

    // return user;
  },
);
