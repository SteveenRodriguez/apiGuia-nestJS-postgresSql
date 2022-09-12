import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeddService {
  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(User) // patron repository
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    // Se guarda en una constante para poder enviarlo al insertNewProducst
    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return 'Seed Executed';
  }

  private async deleteTables() {
    // llama al método del servicio de productos que elimina todos los productos
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users; // se obtienen los usuarios a insertar

    const users: User[] = [];

    seedUsers.forEach((user) => {
      // prepara el usuario para guardarlo en la BD
      users.push(this.userRepository.create(user));
    });

    // Guarda los Users en la BD
    const dbUsers = await this.userRepository.save(seedUsers);

    // se retorna para poder enviarlo al insertNewProducts
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts(); // Elimina la data en la BD

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
