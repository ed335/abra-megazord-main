import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function getUsuarioFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = getJWTSecret();
    return jwt.verify(token, jwtSecret) as { sub: string };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = getUsuarioFromToken(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { paciente: true },
    });

    if (!usuario || !usuario.paciente) {
      return NextResponse.json({ message: 'Usuario nao encontrado' }, { status: 404 });
    }

    const p = usuario.paciente;

    return NextResponse.json({
      id: p.id,
      nome: p.nome,
      email: p.email,
      cpf: p.cpf || '',
      whatsapp: p.whatsapp || '',
      telefone: p.telefone || '',
      dataNascimento: p.dataNascimento?.toISOString().split('T')[0] || '',
      rua: p.rua || '',
      numero: p.numero || '',
      complemento: p.complemento || '',
      bairro: p.bairro || '',
      cidade: p.cidade || '',
      estado: p.estado || '',
      cep: p.cep || '',
      patologiaCID: p.patologiaCID || '',
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ message: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const decoded = getUsuarioFromToken(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { paciente: true },
    });

    if (!usuario || !usuario.paciente) {
      return NextResponse.json({ message: 'Usuario nao encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { nome, cpf, whatsapp, telefone, dataNascimento, rua, numero, complemento, bairro, cidade, estado, cep } = body;

    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return NextResponse.json({ message: 'CPF deve ter 11 digitos' }, { status: 400 });
      }
      
      const cpfExistente = await prisma.paciente.findFirst({
        where: { 
          cpf: cpfLimpo,
          id: { not: usuario.paciente.id }
        }
      });
      
      if (cpfExistente) {
        return NextResponse.json({ message: 'CPF ja cadastrado por outro usuario' }, { status: 400 });
      }
    }

    const updatedPaciente = await prisma.paciente.update({
      where: { id: usuario.paciente.id },
      data: {
        ...(nome && { nome }),
        ...(cpf && { cpf: cpf.replace(/\D/g, '') }),
        ...(whatsapp && { whatsapp }),
        ...(telefone !== undefined && { telefone }),
        ...(dataNascimento && { dataNascimento: new Date(dataNascimento) }),
        ...(rua !== undefined && { rua }),
        ...(numero !== undefined && { numero }),
        ...(complemento !== undefined && { complemento }),
        ...(bairro !== undefined && { bairro }),
        ...(cidade !== undefined && { cidade }),
        ...(estado !== undefined && { estado }),
        ...(cep !== undefined && { cep: cep?.replace(/\D/g, '') }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Perfil atualizado com sucesso',
      paciente: {
        id: updatedPaciente.id,
        nome: updatedPaciente.nome,
        cpf: updatedPaciente.cpf,
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ message: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
