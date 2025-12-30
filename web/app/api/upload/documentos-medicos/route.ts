import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
export const dynamic = 'force-dynamic';

const UPLOADS_DIR = join(process.cwd(), '..', 'backend', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/tiff',
  'application/pdf'
];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'tif', 'pdf'];

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pelo menos um documento médico é obrigatório' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, message: `Máximo de ${MAX_FILES} arquivos permitidos` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `O arquivo "${file.name}" excede 10MB. Tente reduzir a qualidade ou converter para PDF.` },
          { status: 400 }
        );
      }
      
      const fileExtension = getFileExtension(file.name);
      const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);
      
      if (!isValidType) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Formato "${fileExtension || file.type}" não suportado no arquivo "${file.name}". Formatos aceitos: JPG, PNG, GIF, WebP, HEIC (iPhone), BMP, TIFF ou PDF.`
          },
          { status: 400 }
        );
      }
    }

    await mkdir(UPLOADS_DIR, { recursive: true });

    const processedFiles = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'bin';
      const filename = `${uuidv4()}.${ext}`;
      const filepath = join(UPLOADS_DIR, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      processedFiles.push({
        filename,
        url: `/uploads/${filename}`,
        originalName: file.name,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${files.length} documento(s) médico(s) enviado(s) com sucesso`,
      data: {
        files: processedFiles,
        urls: processedFiles.map(f => f.url),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar upload' },
      { status: 500 }
    );
  }
}
