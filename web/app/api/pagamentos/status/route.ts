import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jsonwebtoken from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return secret;
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: decoded.sub }
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const pagamentoId = searchParams.get('pagamentoId');

    if (pagamentoId) {
      // Get specific payment status
      const pagamento = await (prisma as any).pagamento.findFirst({
        where: { 
          id: pagamentoId,
          pacienteId: paciente.id 
        },
        include: { assinatura: true }
      });

      if (!pagamento) {
        return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        pagamento: {
          id: pagamento.id,
          tipo: pagamento.tipo,
          valor: Number(pagamento.valor),
          status: pagamento.status,
          pixCode: pagamento.pixCode,
          expiracao: pagamento.pixExpiracao,
          pagoEm: pagamento.pagoEm,
          criadoEm: pagamento.criadoEm,
        }
      });
    }

    // Get active subscription and recent payments
    const assinaturaAtiva = await (prisma as any).assinatura.findFirst({
      where: { 
        pacienteId: paciente.id,
        status: 'ATIVA'
      },
      include: { plano: true }
    });

    const pagamentosRecentes = await (prisma as any).pagamento.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { criadoEm: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      assinatura: assinaturaAtiva ? {
        id: assinaturaAtiva.id,
        plano: assinaturaAtiva.plano.nome,
        status: assinaturaAtiva.status,
        dataInicio: assinaturaAtiva.dataInicio,
        dataFim: assinaturaAtiva.dataFim,
        proximaCobranca: assinaturaAtiva.proximaCobranca,
      } : null,
      pagamentos: pagamentosRecentes.map((p: any) => ({
        id: p.id,
        tipo: p.tipo,
        valor: Number(p.valor),
        status: p.status,
        pagoEm: p.pagoEm,
        criadoEm: p.criadoEm,
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status de pagamento' },
      { status: 500 }
    );
  }
}
