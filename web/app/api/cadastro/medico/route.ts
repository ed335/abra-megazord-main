import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      whatsapp,
      crm,
      especialidade,
      instituicao,
      cidade,
      estado,
      documentoCrmUrl,
      senha,
      consenteLGPD,
    } = body;

    if (!nome || !email || !whatsapp || !crm || !especialidade || !senha) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'E-mail já cadastrado' },
        { status: 400 }
      );
    }

    const existingCRM = await prisma.prescritor.findUnique({
      where: { crm },
    });

    if (existingCRM) {
      return NextResponse.json(
        { success: false, message: 'CRM já cadastrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PRESCRITOR',
        prescritor: {
          create: {
            nome,
            email,
            crm,
            especialidade,
            instituicao: instituicao || null,
            telefone: whatsapp,
          },
        },
      },
      include: {
        prescritor: true,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: 'CADASTRO_MEDICO',
        recurso: 'PRESCRITOR',
        recursoId: usuario.prescritor?.id,
        detalhes: {
          crm,
          especialidade,
          cidade,
          estado,
          documentoCrmUrl,
          consenteLGPD,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cadastro de médico realizado com sucesso. Aguarde a validação do CRM.',
      data: {
        id: usuario.id,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error('Erro no cadastro de médico:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno ao processar cadastro' },
      { status: 500 }
    );
  }
}
