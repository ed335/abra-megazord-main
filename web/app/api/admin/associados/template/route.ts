import { NextRequest, NextResponse } from 'next/server';
import * as jsonwebtoken from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const headers = [
      'nome*',
      'email*',
      'whatsapp*',
      'senha*',
      'cpf',
      'data_nascimento',
      'cep',
      'rua',
      'numero',
      'complemento',
      'bairro',
      'cidade',
      'estado',
      'patologia_cid',
      'ja_usa_cannabis',
      'termo_ajuizamento',
      'consente_lgpd'
    ];

    const exampleRow = [
      'Maria Silva',
      'maria@email.com',
      '11999998888',
      'senha123',
      '123.456.789-00',
      '1990-05-15',
      '01310-100',
      'Av. Paulista',
      '1000',
      'Apto 101',
      'Bela Vista',
      'São Paulo',
      'SP',
      'F41 - Ansiedade',
      'Não',
      'Sim',
      'Sim'
    ];

    const instructions = [
      '# MODELO DE IMPORTAÇÃO DE ASSOCIADOS - ABRACANM',
      '# Campos marcados com * são obrigatórios',
      '# ',
      '# INSTRUÇÕES:',
      '# 1. Preencha os dados a partir da linha 6 (abaixo do cabeçalho)',
      '# 2. Campos de data devem estar no formato AAAA-MM-DD',
      '# 3. Para ja_usa_cannabis/termo_ajuizamento/consente_lgpd use: Sim ou Não',
      '# 4. WhatsApp apenas números (ex: 11999998888)',
      '# 5. Patologia CID deve incluir código e descrição (ex: F41 - Ansiedade)',
      '# 6. Salve como CSV (UTF-8) antes de importar',
      '#',
      ''
    ];

    const csv = [
      ...instructions,
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');

    const bom = '\uFEFF';
    
    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="modelo_importacao_associados_abracanm.csv"',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar template:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar template' },
      { status: 500 }
    );
  }
}
