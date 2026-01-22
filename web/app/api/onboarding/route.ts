import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { calcularProximoPasso, gerarNumeroAssociado } from '@/lib/onboarding';

const JWT_SECRET = process.env.JWT_SECRET || 'abracanm-secret-key';

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
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
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
      include: {
        documentos: {
          select: {
            tipo: true,
            status: true,
            dataValidade: true,
          },
        },
        assinaturas: {
          where: { status: 'ATIVA' },
          select: {
            status: true,
            plano: { select: { nome: true } },
          },
        },
      },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const proximoPasso = calcularProximoPasso({
      id: paciente.id,
      nome: paciente.nome,
      perfilOnboarding: paciente.perfilOnboarding,
      statusOnboarding: paciente.statusOnboarding,
      etapaOnboarding: paciente.etapaOnboarding,
      onboardingCompleto: paciente.onboardingCompleto,
      objetivoPrincipalOnb: paciente.objetivoPrincipalOnb,
      sintomasOnb: paciente.sintomasOnb,
      documentos: paciente.documentos,
      assinaturas: paciente.assinaturas,
      cpf: paciente.cpf,
      dataNascimento: paciente.dataNascimento,
      whatsapp: paciente.whatsapp,
      consenteLGPD: paciente.consenteLGPD,
    });

    return NextResponse.json({
      paciente: {
        id: paciente.id,
        nome: paciente.nome,
        perfilOnboarding: paciente.perfilOnboarding,
        statusOnboarding: paciente.statusOnboarding,
        etapaOnboarding: paciente.etapaOnboarding,
        onboardingCompleto: paciente.onboardingCompleto,
        numeroAssociado: paciente.numeroAssociado,
      },
      proximoPasso,
      documentos: paciente.documentos,
    });
  } catch (error) {
    console.error('Erro ao buscar status onboarding:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { etapa, dados } = body;

    const paciente = await prisma.paciente.findFirst({
      where: { usuarioId: decoded.sub },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const updateData: any = {};

    switch (etapa) {
      case 0:
        if (dados.perfilOnboarding) {
          updateData.perfilOnboarding = dados.perfilOnboarding;
          updateData.etapaOnboarding = 1;
        }
        break;

      case 1:
        if (dados.cpf) updateData.cpf = dados.cpf;
        if (dados.dataNascimento) updateData.dataNascimento = new Date(dados.dataNascimento);
        if (dados.nome) updateData.nome = dados.nome;
        if (dados.whatsapp) updateData.whatsapp = dados.whatsapp;
        if (dados.consenteLGPD !== undefined) {
          updateData.consenteLGPD = dados.consenteLGPD;
          if (dados.consenteLGPD) {
            updateData.consentimentoEm = new Date();
          }
        }
        if (dados.termoAjuizamento !== undefined) {
          updateData.termoAjuizamento = dados.termoAjuizamento;
          if (dados.termoAjuizamento) {
            updateData.termoAjuizamentoEm = new Date();
          }
        }
        updateData.etapaOnboarding = 2;
        break;

      case 2:
        if (dados.objetivoPrincipal) updateData.objetivoPrincipalOnb = dados.objetivoPrincipal;
        if (dados.sintomas) updateData.sintomasOnb = dados.sintomas;
        updateData.etapaOnboarding = 3;
        updateData.statusOnboarding = 'DOCS_PENDENTES';
        break;

      case 3:
        updateData.etapaOnboarding = 4;
        break;

      case 4:
        break;
    }

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: paciente.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      paciente: {
        id: pacienteAtualizado.id,
        perfilOnboarding: pacienteAtualizado.perfilOnboarding,
        statusOnboarding: pacienteAtualizado.statusOnboarding,
        etapaOnboarding: pacienteAtualizado.etapaOnboarding,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar onboarding:', error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
      return NextResponse.json({ error: 'CPF já cadastrado no sistema' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
