// import { PartialType } from '@nestjs/mapped-types'; si no se utiliza swagger se deja esta
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
