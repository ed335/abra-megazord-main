import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const cep = params.cep.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      return NextResponse.json(
        { error: 'CEP inválido' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'CEP não encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao buscar CEP' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      cep: data.cep,
      logradouro: data.street || '',
      bairro: data.neighborhood || '',
      cidade: data.city || '',
      estado: data.state || '',
    });

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar CEP' },
      { status: 500 }
    );
  }
}
