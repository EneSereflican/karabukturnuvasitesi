import { Resend } from 'resend';

interface SendCaptainWelcomeEmailParams {
  to: string;
  teamName: string;
  captainToken: string;
  playerInviteToken: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCaptainWelcomeEmail(
  params: SendCaptainWelcomeEmailParams
) {
  const { to, teamName, captainToken, playerInviteToken } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SITE_URL');
  }

  const captainUrl = `${siteUrl}/takim/${captainToken}`;
  const playerUrl = `${siteUrl}/oyuncu-basvuru/${playerInviteToken}`;

  const emailContent = `Sayın Kaptan,

Takım başvurunuz alındı.

Takım takip sayfanız:
${captainUrl}

Bu adresi kaybetmeyin, başvuru durumunuzu bu linkten takip edebilirsiniz.

Oyuncularınıza iletmeniz için davet linki:
${playerUrl}`;

  return resend.emails.send({
    from: 'basvuru@turnuvaburada.com.tr',
    to: to,
    subject: `Takım başvurunuz alındı — ${teamName}`,
    text: emailContent,
  });
}
