import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({
  name:'products_images'
})
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  /**
   * Muchas imagenes puede tener 1 producto
   *
   * 🈹 El primer argumento de ManyToOne es a donde se va a
   * relacionar la tabla en este caso con los productos
   *
   * 🈶 El segundo argumento es recorrer la tabla en donde se va
   * a realizar la relación y definifir que columna la va a
   * contener (La tabla a la que se relaciona esta clase debe
   * ser del mismo tipo => Product al cual se va a relacionar)
   */

  @ManyToOne(() => Product, (product) => product.images,{
    onDelete: 'CASCADE'
  })
  product: Product;
}
