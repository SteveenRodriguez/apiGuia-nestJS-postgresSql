import { Module } from '@nestjs/common';
import { SeddService } from './sedd.service';
import { SeddController } from './sedd.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SeddController],
  providers: [SeddService],
  imports:[
    ProductsModule,
    AuthModule
  ]
})
export class SeddModule {}
