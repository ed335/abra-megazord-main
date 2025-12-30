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

export type AdminTokenPayload = {
  sub: string;
  role: string;
  email: string;
};

export async function verifyAdminToken(request: NextRequest): Promise<AdminTokenPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as AdminTokenPayload;
    
    if (decoded.role !== 'ADMIN') {
      return null;
    }

    const admin = await prisma.admin.findFirst({
      where: { usuarioId: decoded.sub },
      include: {
        usuario: {
          select: {
            id: true,
            ativo: true,
            role: true,
          }
        }
      }
    });

    if (!admin || !admin.usuario.ativo) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

export function getPrismaClient(): PrismaClient {
  return prisma;
}
