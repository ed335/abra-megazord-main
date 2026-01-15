import { NextRequest, NextResponse } from 'next/server';
import { verifyMedicoToken, getMedicoPrismaClient } from '@/lib/medico-auth';

export const dynamic = 'force-dynamic';

const prisma = getMedicoPrismaClient();

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyMedicoToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { prescritor } = auth;

    const perfilCompleto = await prisma.prescritor.findUnique({
      where: { id: prescritor.id },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        especialidades: true,
        crm: true,
        fotoUrl: true,
        bio: true,
        experiencia: true,
        consultaValor: true,
        duracaoConsulta: true,
        intervaloConsultas: true,
        marketplaceVisible: true,
        aceitaNovosPacientes: true,
        crmVerificado: true,
      },
    });

    if (!perfilCompleto) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      perfil: {
        ...perfilCompleto,
        consultaValor: perfilCompleto.consultaValor ? Number(perfilCompleto.consultaValor) : null,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyMedicoToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { prescritor } = auth;
    const body = await request.json();

    const {
      bio,
      experiencia,
      especialidades,
      consultaValor,
      duracaoConsulta,
      intervaloConsultas,
      marketplaceVisible,
      aceitaNovosPacientes,
    } = body;

    if (marketplaceVisible && !prescritor.crmVerificado) {
      return NextResponse.json(
        { error: 'Seu CRM precisa ser verificado antes de aparecer no marketplace' },
        { status: 400 }
      );
    }

    if (marketplaceVisible && !consultaValor) {
      return NextResponse.json(
        { error: 'Defina um valor para a consulta antes de aparecer no marketplace' },
        { status: 400 }
      );
    }

    const perfilAtualizado = await prisma.prescritor.update({
      where: { id: prescritor.id },
      data: {
        bio,
        experiencia,
        especialidades: especialidades || [],
        consultaValor: consultaValor ? consultaValor : null,
        duracaoConsulta: duracaoConsulta || 30,
        intervaloConsultas: intervaloConsultas || 10,
        marketplaceVisible: marketplaceVisible && prescritor.crmVerificado,
        aceitaNovosPacientes: aceitaNovosPacientes ?? true,
      },
      select: {
        id: true,
        nome: true,
        marketplaceVisible: true,
        consultaValor: true,
      },
    });

    return NextResponse.json({
      success: true,
      perfil: {
        ...perfilAtualizado,
        consultaValor: perfilAtualizado.consultaValor ? Number(perfilAtualizado.consultaValor) : null,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
