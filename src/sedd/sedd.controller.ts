import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { SeddService } from './sedd.service';

@ApiTags('Seed') //-> Es el nombre el cual agrupara los endpoints de esta clase
@Controller('sedd')
export class SeddController {
  constructor(private readonly seddService: SeddService) {}

  // @Auth(ValidRoles.admin) 
  @Get()
  executedSeed() {
    return this.seddService.runSeed();
  }
}
