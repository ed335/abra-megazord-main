import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminInfo } from '@/lib/admin-auth';
import { temPermissao, DESCRICAO_CARGOS } from '@/lib/permissions';
import type { CargoAdmin, PermissaoAdmin } from '@/lib/permissions';
import { sendEmail, getAdminInviteEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const hasPermission = temPermissao(
      admin.cargo as CargoAdmin,
      admin.permissoesCustom as PermissaoAdmin[],
      'VER_EQUIPE'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const membros = await prisma.admin.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            paciente: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    return NextResponse.json(membros);
  } catch (error) {
    console.error('Erro ao listar equipe:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const hasPermission = temPermissao(
      admin.cargo as CargoAdmin,
      admin.permissoesCustom as PermissaoAdmin[],
      'GERENCIAR_EQUIPE'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const { email, nome, cargo, setor, notas, permissoesCustom } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado com este email' }, { status: 404 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { usuarioId: usuario.id },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Este usuário já é um administrador' }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { role: 'ADMIN' },
    });

    const cargoFinal = cargo || 'ATENDENTE';
    
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: usuario.id },
      select: { nome: true },
    });

    const novoAdmin = await prisma.admin.create({
      data: {
        usuarioId: usuario.id,
        nome: nome || paciente?.nome || null,
        cargo: cargoFinal,
        setor: setor || null,
        notas: notas || null,
        permissoesCustom: permissoesCustom || [],
        criadoPorId: admin.id,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            paciente: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000');
    const loginUrl = `${baseUrl}/admin/login`;
    const cargoNome = DESCRICAO_CARGOS[cargoFinal as CargoAdmin]?.nome || cargoFinal;

    const nomeParaEmail = novoAdmin.nome || paciente?.nome || 'Administrador';
    let emailEnviado = false;
    try {
      emailEnviado = await sendEmail({
        to: usuario.email,
        subject: 'Você foi adicionado à equipe administrativa - ABRACANM',
        html: getAdminInviteEmailHtml(nomeParaEmail, cargoNome, loginUrl),
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de convite:', emailError);
      emailEnviado = false;
    }

    return NextResponse.json({ ...novoAdmin, emailEnviado }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
