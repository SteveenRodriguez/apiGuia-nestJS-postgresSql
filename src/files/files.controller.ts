import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter';
import { fileNamer } from './helpers/fileNamer';

@ApiTags('Files - Get and Upload') //-> Es el nombre el cual agrupara los endpoints de esta clase
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // Cuando se utiliza este decorador se rompe la funcionalidad de nestJS
    @Param('imageName') imageName: string,
  ) {
    // Obtenemos el path con el método desde el service
    const path = this.filesService.getStaticProductImage(imageName);

    // Enviamos como respuesta el archivo. NO EL PATH
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    // interceptador
    FileInterceptor('file', {
      fileFilter: fileFilter, // se envia la referencia mas no se ejecuta ()
      // limits: {fileSize: 1000} // tamaño del archivo
      // storage sirve para decirle a nest en donde desea guardar los archivos subidos
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProdcutImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;

    return {
      message: 'Archivo Guardado exitosamente',
      // file: file.originalname,
      secureUrl,
    };
  }
}
