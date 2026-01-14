import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jsonwebtoken from 'jsonwebtoken';

const prisma = new PrismaClient();

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
}

export type MedicoTokenPayload = {
  sub: string;
  role: string;
  email: string;
};

export async function verifyMedicoToken(request: NextRequest): Promise<{
  payload: MedicoTokenPayload;
  prescritor: {
    id: string;
    nome: string;
    crm: string;
    especialidade: string;
    crmVerificado: boolean;
  };
} | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as MedicoTokenPayload;
    
    if (decoded.role !== 'MEDICO') {
      return null;
    }

    const prescritor = await prisma.prescritor.findFirst({
      where: { usuarioId: decoded.sub },
      select: {
        id: true,
        nome: true,
        crm: true,
        especialidade: true,
        crmVerificado: true,
        usuario: {
          select: {
            id: true,
            ativo: true,
          }
        }
      }
    });

    if (!prescritor || !prescritor.usuario.ativo) {
      return null;
    }

    return {
      payload: decoded,
      prescritor: {
        id: prescritor.id,
        nome: prescritor.nome,
        crm: prescritor.crm,
        especialidade: prescritor.especialidade,
        crmVerificado: prescritor.crmVerificado,
      }
    };
  } catch {
    return null;
  }
}

export function getMedicoPrismaClient(): PrismaClient {
  return prisma;
}
