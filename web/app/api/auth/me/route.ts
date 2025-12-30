import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

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
    
    let decoded: any;
    try {
      const jwtSecret = getJWTSecret();
      decoded = jwt.verify(token, jwtSecret);
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
          },
        }, 
        prescritor: true, 
        admin: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    let nome = '';
    let cpf = '';
    let planoAtivo = null;
    let assinaturaAtiva = null;
    
    if (usuario.paciente) {
      nome = usuario.paciente.nome;
      cpf = usuario.paciente.cpf || '';
      
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
