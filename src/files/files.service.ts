import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  // Método que obtiene el path del archivo
  getStaticProductImage(imageName: string) {
    // método join que busca el path,  exacto
    const path = join(__dirname, '../../static/products', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }

    return path;
  }
}
