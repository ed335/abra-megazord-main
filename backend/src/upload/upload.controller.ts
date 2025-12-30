import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('documento-identidade')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocumentoIdentidade(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo de documento é obrigatório');
    }

    return {
      success: true,
      message: 'Documento de identidade enviado com sucesso',
      data: {
        filename: file.filename,
        url: this.uploadService.getFileUrl(file.filename),
        originalName: file.originalname,
        size: file.size,
      },
    };
  }

  @Post('documentos-medicos')
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadDocumentosMedicos(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Pelo menos um documento médico é obrigatório');
    }

    this.uploadService.validateFilesCount(files, 5);

    const processedFiles = this.uploadService.processUploadedFiles(files);

    return {
      success: true,
      message: `${files.length} documento(s) médico(s) enviado(s) com sucesso`,
      data: {
        files: processedFiles,
        urls: processedFiles.map(f => f.url),
      },
    };
  }
}
