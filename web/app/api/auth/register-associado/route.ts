import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';
import { gerarCodigoUnico, processarIndicacao, NIVEIS_INDICACAO } from '@/lib/referral';
import { sendWelcomeMessage, sendReferralNotification, sendLevelUpNotification } from '@/lib/evolution';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      nome,
      cpf,
      email,
      whatsapp,
      senha,
      password,
      consenteLGPD,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      documentoIdentidadeUrl,
      patologiaCID,
      jaUsaCannabis,
      documentosMedicosUrls,
      codigoIndicacao,
    } = body;

    const senhaFinal = senha || password;
    
    if (!nome || !cpf || !email || !whatsapp || !senhaFinal) {
      return NextResponse.json(
        { message: 'Dados obrigatórios não informados' },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.' },
        { status: 400 }
      );
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    const existingCpf = await prisma.paciente.findUnique({
      where: { cpf: cleanCpf },
    });

    if (existingCpf) {
      return NextResponse.json(
        { message: 'Este CPF já está cadastrado. Tente fazer login ou entre em contato com o suporte.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(senhaFinal, 10);

    let indicadorId: string | null = null;
    let indicador: { id: string; nome: string; whatsapp: string; pontosIndicacao: number; nivelIndicacao: string } | null = null;
    
    if (codigoIndicacao) {
      const indicadorEncontrado = await prisma.paciente.findUnique({
        where: { codigoIndicacao: codigoIndicacao.toUpperCase() },
        select: { id: true, nome: true, whatsapp: true, pontosIndicacao: true, nivelIndicacao: true },
      });
      if (indicadorEncontrado) {
        indicadorId = indicadorEncontrado.id;
        indicador = indicadorEncontrado;
      }
    }

    const novoCodigoIndicacao = await gerarCodigoUnico(nome);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PACIENTE',
        paciente: {
          create: {
            nome,
            cpf: cleanCpf,
            email,
            whatsapp,
            consenteLGPD: consenteLGPD || false,
            consentimentoEm: consenteLGPD ? new Date() : null,
            cep: cep || null,
            rua: rua || null,
            numero: numero || null,
            complemento: complemento || null,
            bairro: bairro || null,
            cidade: cidade || null,
            estado: estado || null,
            documentoIdentidadeUrl: documentoIdentidadeUrl || null,
            patologiaCID: patologiaCID || null,
            jaUsaCannabis: jaUsaCannabis || false,
            documentosMedicosUrls: documentosMedicosUrls || [],
            codigoIndicacao: novoCodigoIndicacao,
            indicadoPorId: indicadorId,
          },
        },
      },
      include: {
        paciente: true,
      },
    });

    if (indicador && indicadorId) {
      try {
        const resultado = await processarIndicacao(indicadorId, nome, email);
        
        const nivelInfo = NIVEIS_INDICACAO[resultado.novoNivel];
        await sendReferralNotification(
          indicador.whatsapp,
          indicador.nome,
          nome,
          resultado.pontosGanhos,
          indicador.pontosIndicacao + resultado.pontosGanhos,
          `${nivelInfo.emoji} ${nivelInfo.nome}`
        );

        if (resultado.subiuDeNivel) {
          await sendLevelUpNotification(
            indicador.whatsapp,
            indicador.nome,
            nivelInfo.nome,
            nivelInfo.emoji,
            nivelInfo.beneficios
          );
        }
      } catch (refError) {
        console.error('Erro ao processar indicação:', refError);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://abracanm.org.br';
    const preAnamneseLink = `${baseUrl}/paciente/pre-anamnese`;
    
    sendWelcomeMessage(whatsapp, nome, preAnamneseLink, novoCodigoIndicacao).catch(err => {
      console.error('Erro ao enviar WhatsApp de boas-vindas:', err);
    });

    const token = jwt.sign(
      { 
        sub: usuario.id, 
        email: usuario.email, 
        role: usuario.role 
      },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Cadastro realizado com sucesso',
      user: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nome: usuario.paciente?.nome,
        codigoIndicacao: novoCodigoIndicacao,
      },
      access_token: token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Erro ao processar cadastro' },
      { status: 500 }
    );
  }
}
