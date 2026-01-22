import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { TipoDocumento } from '@prisma/client';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
}

export const dynamic = 'force-dynamic';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.split(' ')[1];
    const jwtSecret = getJWTSecret();
    return jwt.verify(token, jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paciente = await prisma.paciente.findFirst({
      where: { usuarioId: decoded.sub },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const documentos = await prisma.documento.findMany({
      where: { pacienteId: paciente.id },
      include: {
        versoes: {
          orderBy: { versao: 'desc' },
          take: 5,
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    return NextResponse.json({ documentos });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tipo = formData.get('tipo') as TipoDocumento;
    const dataEmissao = formData.get('dataEmissao') as string | null;
    const dataValidade = formData.get('dataValidade') as string | null;

    if (!file || !tipo) {
      return NextResponse.json({ error: 'Arquivo e tipo são obrigatórios' }, { status: 400 });
    }

    const paciente = await prisma.paciente.findFirst({
      where: { usuarioId: decoded.sub },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${paciente.id}_${tipo}_${Date.now()}_${file.name}`;
    const uploadPath = `/uploads/documentos/${fileName}`;
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documentos');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    const documentoExistente = await prisma.documento.findFirst({
      where: {
        pacienteId: paciente.id,
        tipo: tipo,
      },
    });

    let documento;

    if (documentoExistente) {
      await prisma.documentoVersao.create({
        data: {
          documentoId: documentoExistente.id,
          versao: documentoExistente.versao,
          url: documentoExistente.url || '',
          nomeArquivo: documentoExistente.nomeArquivo,
          tamanho: documentoExistente.tamanho,
          status: documentoExistente.status,
          motivoRejeicao: documentoExistente.motivoRejeicao,
        },
      });

      documento = await prisma.documento.update({
        where: { id: documentoExistente.id },
        data: {
          url: uploadPath,
          nomeArquivo: file.name,
          tamanho: file.size,
          mimeType: file.type,
          status: 'ENVIADO',
          versao: documentoExistente.versao + 1,
          dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
          dataValidade: dataValidade ? new Date(dataValidade) : null,
          motivoRejeicao: null,
          revisadoPorId: null,
          revisadoEm: null,
        },
      });
    } else {
      documento = await prisma.documento.create({
        data: {
          pacienteId: paciente.id,
          tipo: tipo,
          status: 'ENVIADO',
          url: uploadPath,
          nomeArquivo: file.name,
          tamanho: file.size,
          mimeType: file.type,
          dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
          dataValidade: dataValidade ? new Date(dataValidade) : null,
        },
      });
    }

    await prisma.auditoriaDocumento.create({
      data: {
        documentoId: documento.id,
        pacienteId: paciente.id,
        acao: 'UPLOAD',
        detalhes: {
          tipo: tipo,
          nomeArquivo: file.name,
          tamanho: file.size,
          versao: documento.versao,
        },
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    const todosDocsPendentes = await prisma.documento.count({
      where: {
        pacienteId: paciente.id,
        status: { in: ['PENDENTE'] },
      },
    });

    if (todosDocsPendentes === 0) {
      await prisma.paciente.update({
        where: { id: paciente.id },
        data: { statusOnboarding: 'EM_VALIDACAO' },
      });
    }

    return NextResponse.json({
      success: true,
      documento: {
        id: documento.id,
        tipo: documento.tipo,
        status: documento.status,
        versao: documento.versao,
      },
    });
  } catch (error) {
    console.error('Erro ao enviar documento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
