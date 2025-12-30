import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterAssociadoDto } from './dto/register-associado.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-associado')
  registerAssociado(@Body() dto: RegisterAssociadoDto) {
    return this.authService.registerAssociado(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @Request()
    req: { user: { userId: string; email: string; role: string } },
  ) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        ativo: true,
        emailVerificado: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return { user };
  }
}
