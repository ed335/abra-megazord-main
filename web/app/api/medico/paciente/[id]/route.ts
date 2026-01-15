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

    const hasRelationship = await prisma.agendamento.findFirst({
      where: {
        pacienteId: id,
        prescritorId: prescritor.id,
      },
    });

    if (!hasRelationship) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar este paciente' },
        { status: 403 }
      );
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        cpf: true,
        dataNascimento: true,
        preAnamnese: true,
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
            descricao: true,
            dosagem: true,
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
        prescricoes: paciente.prescricoes.map(p => ({
          ...p,
          conteudo: p.descricao,
        })),
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
