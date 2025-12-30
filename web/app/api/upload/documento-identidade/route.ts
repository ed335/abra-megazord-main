import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
export const dynamic = 'force-dynamic';

const UPLOADS_DIR = join(process.cwd(), '..', 'backend', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
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
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Arquivo de documento é obrigatório' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Arquivo muito grande. Máximo permitido: 10MB. Tente reduzir a qualidade da imagem ou use um PDF.' },
        { status: 400 }
      );
    }

    const fileExtension = getFileExtension(file.name);
    const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isValidType) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Formato "${fileExtension || file.type}" não suportado. Formatos aceitos: JPG, PNG, GIF, WebP, HEIC (iPhone), BMP, TIFF ou PDF. Se tirou foto pelo celular, tente usar a opção de compartilhar como imagem ou converter para JPG.`
        },
        { status: 400 }
      );
    }

    await mkdir(UPLOADS_DIR, { recursive: true });

    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${uuidv4()}.${ext}`;
    const filepath = join(UPLOADS_DIR, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Documento de identidade enviado com sucesso',
      data: {
        filename,
        url: `/uploads/${filename}`,
        originalName: file.name,
        size: file.size,
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
