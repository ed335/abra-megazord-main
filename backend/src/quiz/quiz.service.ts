import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntakeDto } from './dto/create-intake.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async createIntake(dto: CreateIntakeDto) {
    return this.prisma.intake.create({
      data: {
        perfil: dto.perfil,
        condicaoPrincipal: dto.condicaoPrincipal,
        objetivoPrincipal: dto.objetivoPrincipal,
        gravidade: dto.gravidade,
        tratamentosPrevios: dto.tratamentosPrevios ?? [],
        comorbidades: dto.comorbidades ?? [],
        notas: dto.notas,
        preferenciaAcompanhamento: dto.preferenciaAcompanhamento,
        melhorHorario: dto.melhorHorario,
        contatoEmail: dto.contatoEmail,
        contatoWhatsapp: dto.contatoWhatsapp,
        cidade: dto.cidade,
        estado: dto.estado,
        consentiu: dto.consentiu ?? false,
        origem: dto.origem,
      },
    });
  }
}
