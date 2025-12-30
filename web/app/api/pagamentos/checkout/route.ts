import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPixPayment } from '@/lib/syncpay';
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

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para realizar um pagamento' },
        { status: 401 }
      );
    }

    const paciente = await (prisma as any).paciente.findUnique({
      where: { usuarioId: decoded.sub },
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Perfil de paciente não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { tipo, planoId, cpf, agendamentoId } = body as { 
      tipo: 'MENSALIDADE' | 'CONSULTA' | 'PRIMEIRA_CONSULTA';
      planoId?: string;
      cpf: string;
      agendamentoId?: string;
    };

    if (!cpf || cpf.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido. Informe apenas os 11 dígitos.' },
        { status: 400 }
      );
    }

    // Get plan or use default pricing
    let valor: number;
    let descricao: string;
    let plano = null;

    if (planoId) {
      plano = await (prisma as any).plano.findUnique({ where: { id: planoId } });
      if (!plano) {
        return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
      }
    }

    // Determine pricing based on type
    switch (tipo) {
      case 'MENSALIDADE':
        valor = plano ? Number(plano.valorMensalidade) : 39.90;
        descricao = `Mensalidade ABRACANM - ${plano?.nome || 'Plano Essencial'}`;
        break;
      case 'PRIMEIRA_CONSULTA':
        valor = plano ? Number(plano.valorPrimeiraConsulta) : 99.00;
        descricao = 'Primeira Consulta ABRACANM';
        break;
      case 'CONSULTA':
        valor = plano ? Number(plano.valorConsulta) : 149.00;
        descricao = 'Consulta Médica ABRACANM';
        break;
      default:
        return NextResponse.json({ error: 'Tipo de pagamento inválido' }, { status: 400 });
    }

    // Get webhook URL
    let baseUrl = 'http://localhost:5000';
    if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    }
    const webhookUrl = `${baseUrl}/api/pagamentos/webhook`;

    // Create Pix payment via Syncpay
    let phone = paciente.whatsapp ? paciente.whatsapp.replace(/\D/g, '') : '';
    // Syncpay requires phone with 10-11 digits, use default if invalid
    if (phone.length < 10 || phone.length > 11) {
      phone = '11999999999'; // Default placeholder phone
    }
    const pixResponse = await createPixPayment(
      valor,
      descricao,
      {
        name: paciente.nome,
        cpf: cpf,
        email: paciente.email,
        phone: phone,
      },
      webhookUrl
    );

    // Create or get subscription
    let assinatura = null;
    if (tipo === 'MENSALIDADE' && planoId) {
      assinatura = await (prisma as any).assinatura.create({
        data: {
          pacienteId: paciente.id,
          planoId: planoId,
          status: 'PENDENTE',
        }
      });
    }

    // Save payment record with agendamentoId if it's a consultation payment
    const pagamento = await (prisma as any).pagamento.create({
      data: {
        pacienteId: paciente.id,
        assinaturaId: assinatura?.id,
        agendamentoId: agendamentoId || null, // Vincular ao agendamento
        tipo: tipo,
        valor: valor,
        status: 'PENDENTE',
        syncpayIdentifier: pixResponse.identifier,
        pixCode: pixResponse.pix_code,
        pixExpiracao: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
        clienteNome: paciente.nome,
        clienteCpf: cpf,
        clienteEmail: paciente.email,
        clienteTelefone: paciente.whatsapp,
      }
    });

    return NextResponse.json({
      success: true,
      pagamento: {
        id: pagamento.id,
        valor: valor,
        pixCode: pixResponse.pix_code,
        identifier: pixResponse.identifier,
        expiracao: pagamento.pixExpiracao,
      }
    });

  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
