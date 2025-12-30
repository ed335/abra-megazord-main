// Syncpay Payment Gateway Integration
// Documentation: https://syncpay.apidog.io

interface SyncpayAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

interface SyncpayClient {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface SyncpayCashInRequest {
  amount: number;
  description?: string;
  webhook_url?: string;
  client?: SyncpayClient;
}

interface SyncpayCashInResponse {
  message: string;
  pix_code: string;
  identifier: string;
}

interface SyncpayTransactionStatus {
  data: {
    id: string;
    client: {
      name: string;
      email: string;
      document: string;
    };
    pix_code: string;
    amount: number;
    final_amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'med';
    payment_method: string;
    created_at: string;
    updated_at: string;
  };
}

// Token cache
let cachedToken: { token: string; expiresAt: Date } | null = null;

const SYNCPAY_API_URL = process.env.SYNCPAY_API_URL || 'https://api.syncpayments.com.br';

export async function getSyncpayToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > new Date()) {
    return cachedToken.token;
  }

  const clientId = process.env.SYNCPAY_CLIENT_ID;
  const clientSecret = process.env.SYNCPAY_CLIENT_SECRET;

  console.log('[Syncpay] Iniciando autenticação...');
  console.log('[Syncpay] Client ID presente:', !!clientId);
  console.log('[Syncpay] Client Secret presente:', !!clientSecret);

  if (!clientId || !clientSecret) {
    console.error('[Syncpay] Credenciais não configuradas');
    throw new Error('Credenciais Syncpay não configuradas. Configure SYNCPAY_CLIENT_ID e SYNCPAY_CLIENT_SECRET.');
  }

  const authUrl = `${SYNCPAY_API_URL}/api/partner/v1/auth-token`;
  console.log('[Syncpay] Auth URL:', authUrl);

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Syncpay] Auth error status:', response.status);
    console.error('[Syncpay] Auth error body:', error);
    throw new Error(`Falha na autenticação com Syncpay: ${response.status} - ${error}`);
  }

  const data: SyncpayAuthResponse = await response.json();
  
  // Cache the token (expires 5 minutes before actual expiry for safety)
  cachedToken = {
    token: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in - 300) * 1000),
  };

  return data.access_token;
}

export async function createPixPayment(
  amount: number,
  description: string,
  client: SyncpayClient,
  webhookUrl?: string
): Promise<SyncpayCashInResponse> {
  const token = await getSyncpayToken();

  const payload: SyncpayCashInRequest = {
    amount,
    description,
    client,
  };

  if (webhookUrl) {
    payload.webhook_url = webhookUrl;
  }

  const response = await fetch(`${SYNCPAY_API_URL}/api/partner/v1/cash-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Syncpay cash-in error:', error);
    throw new Error('Falha ao gerar pagamento Pix');
  }

  return response.json();
}

export async function getTransactionStatus(identifier: string): Promise<SyncpayTransactionStatus> {
  const token = await getSyncpayToken();

  const response = await fetch(`${SYNCPAY_API_URL}/api/partner/v1/transactions/${identifier}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Syncpay status error:', error);
    throw new Error('Falha ao consultar status do pagamento');
  }

  return response.json();
}

// Webhook payload types
export interface SyncpayWebhookPayload {
  data: {
    id: string;
    client: {
      name: string;
      email: string;
      document: string;
    };
    pix_code: string;
    amount: number;
    final_amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'med';
    payment_method: string;
    created_at: string;
    updated_at: string;
  };
}

export function isPaymentCompleted(status: string): boolean {
  return status === 'completed';
}

export function isPaymentFailed(status: string): boolean {
  return status === 'failed' || status === 'refunded';
}
