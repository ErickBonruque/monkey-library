// Integração com serviço de e-mail (nodemailer).
//
// Em produção, basta configurar as variáveis SMTP_* no ambiente. Sem essa
// configuração, o módulo cria automaticamente uma conta de testes no Ethereal
// (https://ethereal.email) — o e-mail não chega a uma caixa real, mas o
// nodemailer devolve uma URL de pré-visualização que comprova o envio. Isso
// permite demonstrar a funcionalidade sem depender de um servidor SMTP real.

import nodemailer from "nodemailer"

let transporterPromise = null

async function getTransporter() {
  if (transporterPromise) return transporterPromise

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    }

    // Sem SMTP configurado: usa uma conta de testes do Ethereal.
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
  })()

  return transporterPromise
}

// Envia o e-mail e retorna a URL de pré-visualização (quando em modo Ethereal),
// que é repassada na resposta da API para facilitar a validação do trabalho.
export async function sendMail({ to, subject, html }) {
  const transporter = await getTransporter()
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Sistema de Estoque" <no-reply@sistema-estoque.local>',
    to,
    subject,
    html,
  })
  return { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null }
}

// Monta o HTML do convite com o link de cadastro.
export function buildInviteEmail({ acceptUrl, role, expiresAt }) {
  const roleLabels = { admin: "Administrador", manager: "Gerente", viewer: "Visualizador" }
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111">
      <h2>Você foi convidado para o Sistema de Estoque</h2>
      <p>Um administrador convidou você para acessar o sistema com o perfil
         <strong>${roleLabels[role] ?? role}</strong>.</p>
      <p>Para concluir seu cadastro, clique no botão abaixo:</p>
      <p style="margin: 24px 0">
        <a href="${acceptUrl}"
           style="background:#0f172a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
          Aceitar convite
        </a>
      </p>
      <p style="font-size:13px;color:#555">
        Este convite é válido até <strong>${new Date(expiresAt).toLocaleString("pt-BR")}</strong>.
        Se você não esperava este e-mail, pode ignorá-lo.
      </p>
      <p style="font-size:12px;color:#888">Ou copie e cole este endereço no navegador:<br>${acceptUrl}</p>
    </div>
  `
}
