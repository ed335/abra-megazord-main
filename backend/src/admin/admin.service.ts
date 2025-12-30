import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAdminExists() {
    const adminCount = await this.prisma.usuario.count({
      where: { role: Role.ADMIN },
    });
    return { exists: adminCount > 0, count: adminCount };
  }

  async createFirstAdmin(email: string, password: string, nome: string) {
    const { exists } = await this.checkAdminExists();
    if (exists) {
      throw new ForbiddenException('Já existe um administrador no sistema');
    }

    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          email: email.toLowerCase(),
          password: passwordHash,
          role: Role.ADMIN,
          ativo: true,
          emailVerificado: true,
        },
        select: { id: true, email: true, role: true },
      });

      await tx.admin.create({
        data: {
          usuarioId: user.id,
          permissoes: ['*'],
          notas: `Primeiro admin criado em ${new Date().toISOString()}`,
        },
      });

      return user;
    });

    return { user: result, message: 'Administrador criado com sucesso' };
  }

  async getAssociados(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [associados, total] = await Promise.all([
      this.prisma.paciente.findMany({
        skip,
        take: limit,
        orderBy: { criadoEm: 'desc' },
        select: {
          id: true,
          nome: true,
          email: true,
          whatsapp: true,
          cidade: true,
          estado: true,
          jaUsaCannabis: true,
          patologiaCID: true,
          termoAjuizamento: true,
          consenteLGPD: true,
          criadoEm: true,
          usuario: {
            select: {
              ativo: true,
              emailVerificado: true,
            },
          },
        },
      }),
      this.prisma.paciente.count(),
    ]);

    return {
      data: associados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAssociadoById(id: string) {
    return this.prisma.paciente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            email: true,
            ativo: true,
            emailVerificado: true,
            criadoEm: true,
          },
        },
      },
    });
  }
}
