import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(request: NextRequest) {
  try {
    const { channelName, uid = 0 } = await request.json();

    if (!channelName) {
      return NextResponse.json(
        { error: 'channelName é obrigatório' },
        { status: 400 }
      );
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      console.error('AGORA_APP_ID ou AGORA_APP_CERTIFICATE não configurados');
      return NextResponse.json(
        { error: 'Configuração do Agora incompleta' },
        { status: 500 }
      );
    }

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return NextResponse.json({ token, uid });
  } catch (error) {
    console.error('Erro ao gerar token Agora:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar token' },
      { status: 500 }
    );
  }
}
