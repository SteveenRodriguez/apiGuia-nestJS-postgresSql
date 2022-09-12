import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

// Para utilizar el class-validator debemos ejecutar el comando npm i class-validator class-transformer
export class CreateProductDto {
  @ApiProperty({
    description: 'Prudct Title (unique)',
    nullable: false, //#red-> No puede venir nulo //#
    minLength: 1,
  })
  @IsString()
  @MinLength(1) // debe tener mínimo 1 caracter
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  // Si le colocamos con signo ? es opcional para nest pero con el decorador @IsOptional() va ser opcional en la petición
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty()
  // each: true => cada elemento debe cumplir con ser un String
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty()
  // IsIn == Estará dentro de las opciones que yo le pase en el parámetro del decorador en este caso como array
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
