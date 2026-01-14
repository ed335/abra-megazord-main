import { NextRequest, NextResponse } from 'next/server';
import { verifyMedicoToken, getMedicoPrismaClient } from '@/lib/medico-auth';

export const dynamic = 'force-dynamic';

const prisma = getMedicoPrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyMedicoToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { prescritor } = auth;
    const { id } = params;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        cpf: true,
        dataNascimento: true,
        preAnamnese: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        agendamentos: {
          where: { prescritorId: prescritor.id },
          orderBy: { dataHora: 'desc' },
          take: 10,
          select: {
            id: true,
            dataHora: true,
            tipo: true,
            status: true,
          },
        },
        prescricoes: {
          where: { prescritorId: prescritor.id },
          orderBy: { criadoEm: 'desc' },
          take: 10,
          select: {
            id: true,
            conteudo: true,
            criadoEm: true,
            status: true,
          },
        },
      },
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      paciente: {
        ...paciente,
        cpf: paciente.cpf ? `***.***.${paciente.cpf.slice(-6, -2)}-**` : null,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar paciente' },
      { status: 500 }
    );
  }
}
