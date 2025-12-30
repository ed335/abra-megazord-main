import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: { sub: string };
    try {
      const jwtSecret = getJWTSecret();
      decoded = jwt.verify(token, jwtSecret) as { sub: string };
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { medicoId, data, horario, tipo, motivo } = await request.json();

    if (!medicoId || !data || !horario) {
      return NextResponse.json(
        { error: 'medicoId, data e horario são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { paciente: true },
    });

    if (!usuario?.paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }

    const medico = await (prisma as any).prescritor.findUnique({
      where: { id: medicoId },
    });

    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }

    const [hora, minuto] = horario.split(':').map(Number);
    const dataHora = new Date(data);
    dataHora.setHours(hora, minuto, 0, 0);

    const conflito = await (prisma as any).agendamento.findFirst({
      where: {
        prescritorId: medicoId,
        dataHora,
        status: {
          in: ['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO'],
        },
      },
    });

    if (conflito) {
      return NextResponse.json(
        { error: 'Horário não está mais disponível' },
        { status: 409 }
      );
    }

    const salaId = `abracanm-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Criar agendamento com status PENDENTE_PAGAMENTO
    // O horário só será confirmado após validação do pagamento Pix
    const agendamento = await (prisma as any).agendamento.create({
      data: {
        pacienteId: usuario.paciente.id,
        prescritorId: medicoId,
        dataHora,
        duracao: medico.duracaoConsulta || 30,
        tipo: tipo || 'PRIMEIRA_CONSULTA',
        status: 'PENDENTE_PAGAMENTO',
        motivo,
        salaId,
      },
      include: {
        prescritor: {
          select: { nome: true, especialidade: true },
        },
        paciente: {
          select: { nome: true, whatsapp: true },
        },
      },
    });

    // WhatsApp de confirmação só será enviado após pagamento confirmado

    return NextResponse.json({
      success: true,
      agendamento: {
        id: agendamento.id,
        dataHora: agendamento.dataHora,
        medico: agendamento.prescritor?.nome,
        especialidade: agendamento.prescritor?.especialidade,
        status: agendamento.status,
        pendentePagamento: true,
      },
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    );
  }
}
