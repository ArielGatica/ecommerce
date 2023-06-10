import { 
  BadRequestException, 
  Controller, 
  Post, 
  Get,
  UploadedFile, 
  UseInterceptors, 
  Param,
  Res } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { Response } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findImage(
    @Res() res: Response,
    @Param('imageName') imageName: string) {
    const path = this.filesService.getStaticProductImage(imageName)
    res.sendFile(path)
  }

  @Post('product')
  @UseInterceptors(FileInterceptor( 'file', { 
    fileFilter: fileFilter, 
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadFiles(@UploadedFile() file: Express.Multer.File) {
    if(!file)
      throw new BadRequestException('Make sure that the file is an image')

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return { secureUrl }
  }
}
