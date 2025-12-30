import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getJWTSecret } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string; role: string };
    
    if (decoded.role !== 'ADMIN') {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseBoolean(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return lower === 'sim' || lower === 'yes' || lower === 'true' || lower === '1';
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não enviado' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => !line.startsWith('#') && line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou sem dados' },
        { status: 400 }
      );
    }

    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.replace('*', '').toLowerCase().trim());
    
    const results = {
      success: 0,
      errors: [] as { linha: number; email: string; erro: string }[],
      skipped: 0
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const nome = row['nome'];
      const email = row['email'];
      const whatsapp = row['whatsapp']?.replace(/\D/g, '');
      const senha = row['senha'];

      if (!nome || !email || !whatsapp || !senha) {
        results.errors.push({
          linha: i + 1,
          email: email || 'N/A',
          erro: 'Campos obrigatórios faltando (nome, email, whatsapp, senha)'
        });
        continue;
      }

      try {
        const existingUser = await prisma.usuario.findUnique({
          where: { email }
        });

        if (existingUser) {
          results.skipped++;
          continue;
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const usuario = await prisma.usuario.create({
          data: {
            email,
            password: hashedPassword,
            role: 'PACIENTE',
            ativo: true,
            emailVerificado: false
          }
        });

        await prisma.paciente.create({
          data: {
            usuarioId: usuario.id,
            nome,
            email,
            whatsapp,
            cpf: row['cpf'] || null,
            dataNascimento: row['data_nascimento'] ? new Date(row['data_nascimento']) : null,
            cep: row['cep'] || null,
            rua: row['rua'] || null,
            numero: row['numero'] || null,
            complemento: row['complemento'] || null,
            bairro: row['bairro'] || null,
            cidade: row['cidade'] || null,
            estado: row['estado'] || null,
            patologiaCID: row['patologia_cid'] || null,
            jaUsaCannabis: parseBoolean(row['ja_usa_cannabis'] || ''),
            termoAjuizamento: parseBoolean(row['termo_ajuizamento'] || ''),
            consenteLGPD: parseBoolean(row['consente_lgpd'] || ''),
            consentimentoEm: parseBoolean(row['consente_lgpd'] || '') ? new Date() : null,
            termoAjuizamentoEm: parseBoolean(row['termo_ajuizamento'] || '') ? new Date() : null
          }
        });

        results.success++;
      } catch (err) {
        results.errors.push({
          linha: i + 1,
          email,
          erro: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    }

    return NextResponse.json({
      message: 'Importação concluída',
      results
    });

  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar importação' },
      { status: 500 }
    );
  }
}
