import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  // Recibe contexto donde se utiliza el logger
  private readonly logger = new Logger('ProductsService');

  // Utilización de la entidad Product => PatronRepository
  constructor(
    // Vamos a injectar la entidad Product para utilizar los métodos de repository
    // Le decimos de que tipo será el Repository que vamos a utilizar Repository<Product>
    @InjectRepository(Product)
    private readonly productRepositiory: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepositiory: Repository<ProductImage>,

    // Injectamos para utilizar el queryRunner
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // create() => Crea una instancia Entidad de tipo Product !!!PERO NO LA GUARDA EN LA BD!!!
      // cuando se crea nos da el ID y demas elementos por default
      const product = this.productRepositiory.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepositiory.create({ url: image }),
        ),
        user, // con esto creamos el usuario
      });

      // Guardamos la instancia de Product en la base de datos medianto el repository
      await this.productRepositiory.save(product);

      return { ...product, images: images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepositiory.find({
      take: limit,
      skip: offset,
      // TODO: relaciones, se coloca en true para que muestre las relaciones que se le especifiquen
      relations: {
        images: true,
      },
    });

    // Aplanamos los productos para lograr acceder a las imagenes
    return products.map((product) => ({
      // Agregamos con el operador express el producto
      ...product,

      // ahora mostramos las imagenes aplanadas con el map y accedemos solo al url
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(terminoBusqueda: string) {
    let product: Product;

    if (isUUID(terminoBusqueda)) {
      product = await this.productRepositiory.findOneBy({
        id: terminoBusqueda,
      });
    } else {
      // prod es el alias mediante el QueryBuilder
      const queryBuilder = this.productRepositiory.createQueryBuilder('prod');

      // UPPER => convierte a mayusculas el termino del query
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug `, {
          title: terminoBusqueda.toUpperCase(),
          slug: terminoBusqueda.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(
        `Product with termino Busqueda: ${terminoBusqueda} not found`,
      );
    }

    return product;
  }

  // aplana y devuelve las imagenes de los productos
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    // preload => buscar producto by id y adiconalmente cargar todas las propiedades del Product
    const product = await this.productRepositiory.preload({
      id: id,
      ...toUpdate,
    });

    // Verificamos si existe un producto
    if (!product) {
      throw new NotFoundException(`Product with Id: ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner(); // Create query runner
    await queryRunner.connect(); // Conectar a la base de datos
    await queryRunner.startTransaction(); // comenzamos las transacciones

    try {
      if (images) {
        // Se borran imagenes anteriores
        await queryRunner.manager.delete(ProductImage, { product: { id } }); // Transacción 1

        product.images = images.map((image) =>
          this.productImageRepositiory.create({ url: image }),
        );
      } else {
      }
      // el producto del usuario es igual al usuario que le pasamos por parámetro
      product.user = user;

      // se guarda el producto
      await queryRunner.manager.save(product); // Transacción 2

      // Commit de la transacción
      await queryRunner.commitTransaction();

      await queryRunner.release(); // ya no funciona el queryRunner debe conectarse de nuevo

      // await this.productRepositiory.save(product);

      return this.findOnePlain(id);
    } catch (error) {
      // Si alguna de las dos transacciones no es exitosa devolvemos a la data anterior de la BD
      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    return await this.productRepositiory.remove(product);
  }

  async deleteAllProducts() {
    // Crea la consulta para efectuarla en la BD
    const query = this.productRepositiory.createQueryBuilder('product');

    try {
      // elimina la data en la BD
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Método que muestra los errores
  private handleDBExceptions(error: any) {
    this.logger.error(error);
    if (error.code === '23505') {
      // Mostramos al cliente el error de forma detalla
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException(
      'Unexpected Error, check server logs',
    );
  }
}
