import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medicoId = searchParams.get('medicoId');
    const data = searchParams.get('data');

    if (!medicoId || !data) {
      return NextResponse.json(
        { error: 'medicoId e data são obrigatórios' },
        { status: 400 }
      );
    }

    const dataSelecionada = new Date(data);
    const diaSemana = dataSelecionada.getDay();

    const medico = await prisma.prescritor.findUnique({
      where: { id: medicoId },
      include: {
        disponibilidades: {
          where: { 
            diaSemana,
            ativo: true,
          },
        },
      },
    });

    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }

    if (medico.disponibilidades.length === 0) {
      return NextResponse.json({ horarios: [], mensagem: 'Médico não atende neste dia' });
    }

    const disponibilidade = medico.disponibilidades[0];
    const duracaoConsulta = medico.duracaoConsulta;
    const intervalo = medico.intervaloConsultas;

    const inicioData = new Date(dataSelecionada);
    inicioData.setHours(0, 0, 0, 0);
    
    const fimData = new Date(dataSelecionada);
    fimData.setHours(23, 59, 59, 999);

    const agendamentosExistentes = await prisma.agendamento.findMany({
      where: {
        prescritorId: medicoId,
        dataHora: {
          gte: inicioData,
          lte: fimData,
        },
        status: {
          in: ['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO'],
        },
      },
      select: {
        dataHora: true,
        duracao: true,
      },
    });

    const horariosOcupados = new Set<string>();
    agendamentosExistentes.forEach((ag) => {
      const hora = ag.dataHora.toISOString().substring(11, 16);
      horariosOcupados.add(hora);
    });

    const [horaInicioH, horaInicioM] = disponibilidade.horaInicio.split(':').map(Number);
    const [horaFimH, horaFimM] = disponibilidade.horaFim.split(':').map(Number);

    const horariosDisponiveis: { horario: string; disponivel: boolean }[] = [];
    
    let horaAtual = horaInicioH;
    let minutoAtual = horaInicioM;

    const agora = new Date();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataHoje = new Date(dataSelecionada);
    dataHoje.setHours(0, 0, 0, 0);
    const isHoje = dataHoje.getTime() === hoje.getTime();

    while (horaAtual < horaFimH || (horaAtual === horaFimH && minutoAtual < horaFimM)) {
      const horarioStr = `${horaAtual.toString().padStart(2, '0')}:${minutoAtual.toString().padStart(2, '0')}`;
      
      let disponivel = !horariosOcupados.has(horarioStr);
      
      if (isHoje) {
        const horarioDate = new Date(dataSelecionada);
        horarioDate.setHours(horaAtual, minutoAtual, 0, 0);
        if (horarioDate <= agora) {
          disponivel = false;
        }
      }

      horariosDisponiveis.push({
        horario: horarioStr,
        disponivel,
      });

      minutoAtual += duracaoConsulta + intervalo;
      if (minutoAtual >= 60) {
        horaAtual += Math.floor(minutoAtual / 60);
        minutoAtual = minutoAtual % 60;
      }
    }

    return NextResponse.json({ 
      horarios: horariosDisponiveis,
      medico: {
        nome: medico.nome,
        especialidade: medico.especialidade,
        duracaoConsulta: medico.duracaoConsulta,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar horários disponíveis' },
      { status: 500 }
    );
  }
}
