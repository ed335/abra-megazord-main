import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('setup/check')
  checkAdminExists() {
    return this.adminService.checkAdminExists();
  }

  @Post('setup')
  createFirstAdmin(
    @Body() body: { email: string; password: string; nome: string },
  ) {
    return this.adminService.createFirstAdmin(body.email, body.password, body.nome);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)

  @Get('associados')
  getAssociados(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAssociados(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('associados/:id')
  getAssociadoById(@Param('id') id: string) {
    return this.adminService.getAssociadoById(id);
  }
}
