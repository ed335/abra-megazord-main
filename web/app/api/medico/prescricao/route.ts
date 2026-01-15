import { NextRequest, NextResponse } from 'next/server';
import { verifyMedicoToken, getMedicoPrismaClient } from '@/lib/medico-auth';

export const dynamic = 'force-dynamic';

const prisma = getMedicoPrismaClient();

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyMedicoToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { prescritor } = auth;

    if (!prescritor.crmVerificado) {
      return NextResponse.json(
        { error: 'CRM não verificado. Você não pode emitir prescrições.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      pacienteId,
      medicamento,
      forma,
      concentracao,
      posologia,
      quantidade,
      duracao,
      observacoes,
      cid,
      orientacoes,
    } = body;

    if (!pacienteId || !medicamento || !posologia) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    const hasRelationship = await prisma.agendamento.findFirst({
      where: {
        pacienteId,
        prescritorId: prescritor.id,
      },
    });

    if (!hasRelationship) {
      return NextResponse.json(
        { error: 'Você não tem permissão para prescrever para este paciente' },
        { status: 403 }
      );
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }

    const validadeDe = new Date();
    const validadeAte = new Date();
    
    const duracaoDias = parseInt(duracao) || 30;
    validadeAte.setDate(validadeAte.getDate() + duracaoDias);

    const descricaoCompleta = [
      `Medicamento: ${medicamento}`,
      forma ? `Forma: ${forma}` : '',
      concentracao ? `Concentração: ${concentracao}` : '',
      quantidade ? `Quantidade: ${quantidade}` : '',
      cid ? `CID: ${cid}` : '',
      orientacoes ? `\nOrientações:\n${orientacoes}` : '',
      observacoes ? `\nObservações:\n${observacoes}` : '',
    ].filter(Boolean).join('\n');

    const prescricao = await prisma.prescricao.create({
      data: {
        pacienteId,
        prescritorId: prescritor.id,
        descricao: descricaoCompleta,
        dosagem: posologia,
        frequencia: 'Conforme posologia',
        duracao: duracao || '30 dias',
        validadeDe,
        validadeAte,
        status: 'ATIVA',
      },
    });

    return NextResponse.json({
      success: true,
      prescricao: {
        id: prescricao.id,
        criadoEm: prescricao.criadoEm,
      },
    });
  } catch (error) {
    console.error('Erro ao criar prescrição:', error);
    return NextResponse.json(
      { error: 'Erro ao criar prescrição' },
      { status: 500 }
    );
  }
}
