import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ABRACANM" <noreply@abracanm.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

export function getPasswordResetEmailHtml(nome: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - ABRACANM</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #38840e; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ABRACANM</h1>
              <p style="color: #efda1d; margin: 5px 0 0; font-size: 14px;">Associação Brasileira de Cannabis Medicinal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px; font-size: 22px;">Olá, ${nome}!</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Recebemos uma solicitação para redefinir a senha da sua conta na ABRACANM.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background-color: #38840e; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, ignore este email.
              </p>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="color: #38840e; font-size: 12px; word-break: break-all; margin: 10px 0 0;">
                ${resetLink}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ABRACANM - Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getAdminInviteEmailHtml(nome: string, cargo: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para Equipe Admin - ABRACANM</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #38840e; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ABRACANM</h1>
              <p style="color: #efda1d; margin: 5px 0 0; font-size: 14px;">Associação Brasileira de Cannabis Medicinal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px; font-size: 22px;">Olá, ${nome}!</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Você foi adicionado(a) à <strong>equipe administrativa</strong> da ABRACANM!
              </p>
              <div style="background-color: #f0f9f0; border-left: 4px solid #38840e; padding: 15px 20px; margin: 20px 0;">
                <p style="color: #38840e; font-size: 14px; margin: 0;">
                  <strong>Seu cargo:</strong> ${cargo}
                </p>
              </div>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Agora você tem acesso ao painel administrativo. Para acessar:
              </p>
              <ol style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
                <li>Acesse o painel de administração</li>
                <li>Use o <strong>mesmo email e senha</strong> do seu cadastro de associado</li>
                <li>Explore as funcionalidades disponíveis para seu cargo</li>
              </ol>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background-color: #38840e; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Acessar Painel Admin
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                Se tiver dúvidas sobre suas permissões ou funcionalidades, entre em contato com o Super Administrador.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ABRACANM - Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
