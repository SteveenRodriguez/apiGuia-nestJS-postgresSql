import { ProductImage } from './product-image.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

// Decorador que sirve para marcar como una entidad esta clase y puede renombrar la tabla en la BD
@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '0560602c-77cf-4f74-8287-0794da2d1b55',
    description: 'Product ID',
    uniqueItems: true,
  })
  // Genera un id aleatorio de tipo UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Tittle',
    uniqueItems: true,
  })
  // unique:true => no pueden existir dos productos con el mimos nombre
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
    uniqueItems: true,
  })
  // Le decimos el tipo de dato que soporta la base de datos, float para que sea un número para postgres
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Esto es una description de ejemplo',
    description: 'Product description',
    default: null,
  })
  @Column({
    // Otra forma de decirle que es de tipo texto
    type: 'text',
    // Puede aceptar valores nulos
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product slug - for SEO',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    // unique indica que solo debe exjistir un solo slug
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @Column('int', {
    // Así iniciaría la propieda en la BD
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['M', 'S', 'L'],
    description: 'Product sizes',
  })
  @Column('text', {
    // Indicamos que es un array
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  /** RELACIONES
   * 1 Producto puede tener * muchas imágenes
   *
   * 🈹 El primer argumento de OneToMany es a donde se va a
   * relacionar la tabla en este caso con las Imagenes
   *
   * 🈶 El segundo argumento es recorrer la tabla en donde se va
   * a realizar la relación y definifir que columna la va a
   * contener (La tabla a la que se relaciona esta clase debe
   * ser del mismo tipo => ProductImage al cual se va a relacionar)
   *
   * ♑ El tercer argumento es opcional es un objeto donde se deja
   * la opción de cascade en true para que elimine toda la data
   * si es necesario
   *
   * 🈹 El eager permite utilizar y mostrar las relaciones cuando se
   * utiliza cualquier método find (carga automáticamente las relaciones)*
   */

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true, // => cargue automáticamente la relación
  })
  images?: ProductImage[];

  //? Relación de productos a usuarios
  @ManyToOne(() => User, (user) => user.product, {
    eager: true, // => significa que cargue automáticamente la relación
  })
  user: User;

  // Este decorador lo que hace es ejecutar este método antes de insertar en la DB
  @BeforeInsert()
  chekSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  // Método que se ejecuta antes de actualizar la entidad en la base de datos
  @BeforeUpdate()
  chekSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
