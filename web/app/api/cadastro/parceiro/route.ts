import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razaoSocial,
      nomeFantasia,
      cnpj,
      email,
      telefone,
      whatsapp,
      website,
      tipoParceria,
      responsavelNome,
      responsavelCpf,
      responsavelEmail,
      responsavelTelefone,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      documentoUrl,
      consenteLGPD,
    } = body;

    if (!razaoSocial || !nomeFantasia || !cnpj || !email || !whatsapp || !tipoParceria || !responsavelNome || !responsavelEmail) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    const cnpjDigits = cnpj.replace(/\D/g, '');
    
    const existingParceiro = await prisma.associacaoParceira.findUnique({
      where: { cnpj: cnpjDigits },
    });

    if (existingParceiro) {
      return NextResponse.json(
        { success: false, message: 'CNPJ já cadastrado' },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.associacaoParceira.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'E-mail já cadastrado' },
        { status: 400 }
      );
    }

    const parceiro = await prisma.associacaoParceira.create({
      data: {
        razaoSocial,
        nomeFantasia,
        cnpj: cnpjDigits,
        email,
        telefone: telefone || null,
        whatsapp,
        website: website || null,
        tipoParceria,
        responsavelNome,
        responsavelCpf: responsavelCpf?.replace(/\D/g, '') || null,
        responsavelEmail,
        responsavelTelefone: responsavelTelefone || null,
        cep: cep?.replace(/\D/g, '') || null,
        rua: rua || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        documentoUrl: documentoUrl || null,
        consenteLGPD: consenteLGPD || false,
        consentimentoEm: consenteLGPD ? new Date() : null,
        status: 'PENDENTE',
      },
    });

    await prisma.logAuditoria.create({
      data: {
        acao: 'CADASTRO_PARCEIRO',
        recurso: 'ASSOCIACAO_PARCEIRA',
        recursoId: parceiro.id,
        detalhes: {
          nomeFantasia,
          cnpj: cnpjDigits,
          tipoParceria,
          cidade,
          estado,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cadastro de parceiro enviado com sucesso. Nossa equipe entrará em contato em até 48 horas.',
      data: {
        id: parceiro.id,
      },
    });
  } catch (error) {
    console.error('Erro no cadastro de parceiro:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno ao processar cadastro' },
      { status: 500 }
    );
  }
}
