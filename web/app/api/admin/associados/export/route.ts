import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jsonwebtoken from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string; role: string };
    
    if (decoded.role !== 'ADMIN') {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeCSV(value: string | null | undefined): string {
  if (!value) return '';
  const escaped = value.replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  return escaped;
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const associados = await prisma.paciente.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        usuario: {
          select: {
            ativo: true,
            emailVerificado: true,
          }
        }
      }
    });

    const headers = [
      'Nome',
      'Email',
      'WhatsApp',
      'CPF',
      'Data Nascimento',
      'CEP',
      'Rua',
      'Número',
      'Complemento',
      'Bairro',
      'Cidade',
      'Estado',
      'Patologia (CID)',
      'Já usa cannabis',
      'Condições',
      'Alergias',
      'Medicamentos',
      'Documentos Médicos',
      'Termo Ajuizamento',
      'Consentiu LGPD',
      'Data Cadastro',
      'Status'
    ];

    const rows = associados.map(a => {
      return [
        escapeCSV(a.nome),
        escapeCSV(a.email),
        escapeCSV(a.whatsapp),
        escapeCSV(a.cpf),
        a.dataNascimento ? formatDate(a.dataNascimento) : '',
        escapeCSV(a.cep),
        escapeCSV(a.rua),
        escapeCSV(a.numero),
        escapeCSV(a.complemento),
        escapeCSV(a.bairro),
        escapeCSV(a.cidade),
        escapeCSV(a.estado),
        escapeCSV(a.patologiaCID),
        a.jaUsaCannabis ? 'Sim' : 'Não',
        escapeCSV(a.condicoes?.join('; ')),
        escapeCSV(a.alergias?.join('; ')),
        escapeCSV(a.medicamentos?.join('; ')),
        a.documentosMedicosUrls?.length > 0 ? 'Sim' : 'Não',
        a.termoAjuizamento ? 'Sim' : 'Não',
        a.consenteLGPD ? 'Sim' : 'Não',
        formatDate(a.criadoEm),
        a.usuario.ativo ? 'Ativo' : 'Inativo'
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const bom = '\uFEFF';
    
    const today = new Date().toISOString().split('T')[0];
    
    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="associados_abracanm_${today}.csv"`,
      },
    });

  } catch (error) {
    console.error('Erro ao exportar associados:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar associados' },
      { status: 500 }
    );
  }
}
