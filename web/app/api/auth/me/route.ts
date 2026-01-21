import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

function isOnboardingComplete(paciente: {
  cpf: string | null;
  documentoIdentidadeUrl: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  cidade: string | null;
  estado: string | null;
} | null): boolean {
  if (!paciente) return false;
  return !!(
    paciente.cpf &&
    paciente.documentoIdentidadeUrl &&
    paciente.cep &&
    paciente.rua &&
    paciente.numero &&
    paciente.cidade &&
    paciente.estado
  );
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: TokenPayload;
    try {
      const jwtSecret = getJWTSecret();
      decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    } catch {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { 
        paciente: {
          include: {
            assinaturas: {
              where: { status: 'ATIVA' },
              include: { plano: true },
              orderBy: { criadoEm: 'desc' },
              take: 1,
            },
            preAnamnese: true,
          },
        }, 
        prescritor: true, 
        admin: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    let nome = '';
    let cpf = '';
    let matricula = '';
    let validade = '';
    let planoAtivo = null;
    let assinaturaAtiva = null;
    const hasPreAnamnese = !!usuario.paciente?.preAnamnese;
    const onboardingCompleto = isOnboardingComplete(usuario.paciente);
    
    if (usuario.paciente) {
      nome = usuario.paciente.nome;
      cpf = usuario.paciente.cpf || '';
      
      // Generate matricula from paciente ID
      matricula = `ABR-${usuario.paciente.id.slice(0, 8).toUpperCase()}`;
      
      // Calculate validade: 12 months from registration date
      const dataCadastro = usuario.paciente.criadoEm;
      const dataValidade = new Date(dataCadastro);
      dataValidade.setMonth(dataValidade.getMonth() + 12);
      validade = dataValidade.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      
      const assinatura = usuario.paciente.assinaturas?.[0];
      if (assinatura) {
        assinaturaAtiva = {
          id: assinatura.id,
          status: assinatura.status,
          dataInicio: assinatura.dataInicio,
          dataFim: assinatura.dataFim,
          proximaCobranca: assinatura.proximaCobranca,
        };
        planoAtivo = {
          id: assinatura.plano.id,
          nome: assinatura.plano.nome,
          tipo: assinatura.plano.tipo,
          beneficios: assinatura.plano.beneficios,
        };
      }
    } else if (usuario.prescritor) {
      nome = usuario.prescritor.nome;
    }

    return NextResponse.json({
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
      nome,
      cpf,
      matricula,
      validade,
      plano: planoAtivo?.nome || 'Associado',
      status: assinaturaAtiva ? 'ativo' : 'pendente',
      onboardingCompleto,
      hasPreAnamnese,
      paciente: usuario.paciente ? {
        id: usuario.paciente.id,
        cpf: usuario.paciente.cpf,
        whatsapp: usuario.paciente.whatsapp,
        cidade: usuario.paciente.cidade,
        estado: usuario.paciente.estado,
        documentoIdentidadeUrl: usuario.paciente.documentoIdentidadeUrl,
      } : null,
      planoAtivo,
      assinaturaAtiva,
      isPrescritor: !!usuario.prescritor,
      prescritorId: usuario.prescritor?.id || null,
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}
