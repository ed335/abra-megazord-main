import { Injectable, BadRequestException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadsPath = join(process.cwd(), 'uploads');

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filepath = join(this.uploadsPath, filename);
      await unlink(filepath);
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${filename}:`, error);
    }
  }

  validateFilesCount(files: Express.Multer.File[], maxFiles: number): void {
    if (files.length > maxFiles) {
      throw new BadRequestException(`Máximo de ${maxFiles} arquivos permitidos`);
    }
  }

  processUploadedFiles(files: Express.Multer.File[]): { filename: string; url: string; originalName: string; size: number }[] {
    return files.map(file => ({
      filename: file.filename,
      url: this.getFileUrl(file.filename),
      originalName: file.originalname,
      size: file.size,
    }));
  }
}
