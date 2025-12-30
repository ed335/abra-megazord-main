import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAssociadoDto } from './dto/register-associado.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const role: Role = dto.role ?? Role.PACIENTE;
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.usuario.create({
        data: {
          email,
          password: passwordHash,
          role,
          ativo: true,
          emailVerificado: false,
        },
        select: { id: true, email: true, role: true },
      });

      const accessToken = await this.signToken(user.id, user.email, user.role);
      return { user, accessToken };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('E-mail já registrado');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true, ativo: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const accessToken = await this.signToken(user.id, user.email, user.role);
    const { password, ...safeUser } = user;
    return { user: safeUser, accessToken };
  }

  async registerAssociado(dto: RegisterAssociadoDto) {
    const email = dto.email.toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.usuario.create({
          data: {
            email,
            password: passwordHash,
            role: Role.PACIENTE,
            ativo: true,
            emailVerificado: false,
          },
          select: { id: true, email: true, role: true },
        });

        const paciente = await tx.paciente.create({
          data: {
            usuarioId: user.id,
            nome: dto.nome,
            email,
            whatsapp: dto.whatsapp,
            cep: dto.cep,
            rua: dto.rua,
            numero: dto.numero,
            complemento: dto.complemento || null,
            bairro: dto.bairro || null,
            cidade: dto.cidade,
            estado: dto.estado,
            documentoIdentidadeUrl: dto.documentoIdentidadeUrl || null,
            jaUsaCannabis: dto.jaUsaCannabis,
            patologiaCID: dto.patologiaCID,
            documentosMedicosUrls: dto.documentosMedicosUrls || [],
            termoAjuizamento: dto.termoAjuizamento,
            termoAjuizamentoEm: dto.termoAjuizamento ? new Date() : null,
            consenteLGPD: dto.consenteLGPD,
            consentimentoEm: dto.consenteLGPD ? new Date() : null,
          },
        });

        return { user, paciente };
      });

      const accessToken = await this.signToken(result.user.id, result.user.email, result.user.role);
      return { 
        user: result.user, 
        paciente: { id: result.paciente.id, nome: result.paciente.nome },
        accessToken 
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('E-mail já registrado');
      }
      throw error;
    }
  }

  private signToken(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: (process.env.JWT_EXPIRATION ?? '15m') as any,
    });
  }
}
