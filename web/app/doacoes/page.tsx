'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, Copy, Check, Users, Scale, BookOpen, Server, ArrowLeft, Mail } from 'lucide-react';
import QRCode from 'qrcode';

const PIX_CONFIG = {
  chave: 'saudeabracann@gmail.com',
  nome: 'ASSOCIACAO BRASILEIRA DE',
  cidade: 'BRASILIA',
};

const VALORES_PREDEFINIDOS = [10, 25, 50, 100, 150];

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function gerarPixCopiaECola({
  chave,
  nome,
  cidade,
  valor,
  txid = '***',
}: {
  chave: string;
  nome: string;
  cidade: string;
  valor: number | null;
  txid?: string;
}): string {
  const gui = emv('00', 'br.gov.bcb.pix');
  const key = emv('01', chave);
  const merchantAccountInfo = emv('26', gui + key);

  const mcc = emv('52', '0000');
  const moeda = emv('53', '986');

  const v = valor !== null && valor !== undefined && valor > 0
    ? Number(valor).toFixed(2)
    : null;

  const amount = v ? emv('54', v) : '';

  const country = emv('58', 'BR');
  const merchantName = emv('59', nome);
  const merchantCity = emv('60', cidade);

  const additionalData = emv('62', emv('05', txid));

  const payloadSemCrc =
    emv('00', '01') +
    merchantAccountInfo +
    mcc +
    moeda +
    amount +
    country +
    merchantName +
    merchantCity +
    additionalData +
    '6304';

  const crc = crc16ccitt(payloadSemCrc);
  return payloadSemCrc + crc;
}

export default function DoacoesPage() {
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(25);
  const [valorCustom, setValorCustom] = useState<string>('');
  const [pixCopiaECola, setPixCopiaECola] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const valor = valorCustom ? parseFloat(valorCustom) : valorSelecionado;
    
    if (valor && valor >= 1) {
      const pix = gerarPixCopiaECola({
        chave: PIX_CONFIG.chave,
        nome: PIX_CONFIG.nome,
        cidade: PIX_CONFIG.cidade,
        valor: valor,
        txid: `DOACAO${String(valor).replace(/\D/g, '')}`,
      });
      setPixCopiaECola(pix);

      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, pix, {
          width: 200,
          margin: 2,
          color: {
            dark: '#2D2D2D',
            light: '#FFFFFF',
          },
        });
      }
    }
  }, [valorSelecionado, valorCustom]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleValorClick = (valor: number) => {
    setValorSelecionado(valor);
    setValorCustom('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setValorCustom(value);
    setValorSelecionado(null);
  };

  const valorAtual = valorCustom ? parseFloat(valorCustom) : valorSelecionado;

  const beneficios = [
    { icon: Users, title: 'Acolhimento', description: 'Suporte a novos pacientes' },
    { icon: Scale, title: 'Suporte Jurídico', description: 'Orientação legal' },
    { icon: BookOpen, title: 'Educação', description: 'Conscientização' },
    { icon: Server, title: 'Infraestrutura', description: 'Plataforma e serviços' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-verde-oliva">
            ABRACANM
          </Link>
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-verde-oliva hover:text-verde-claro transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-verde-claro/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-verde-oliva" />
          </div>
          <h1 className="text-3xl font-bold text-cinza-escuro mb-3">
            Apoie a ABRACANM
          </h1>
          <p className="text-cinza-medio max-w-lg mx-auto">
            Sua doação ajuda a manter nosso trabalho de acolhimento e suporte a pacientes 
            que buscam qualidade de vida através da medicina canábica.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-cinza-escuro mb-3">
              Escolha o valor da doação
            </label>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {VALORES_PREDEFINIDOS.map((valor) => (
                <button
                  key={valor}
                  onClick={() => handleValorClick(valor)}
                  className={`py-3 px-2 rounded-lg font-medium text-sm transition ${
                    valorSelecionado === valor && !valorCustom
                      ? 'bg-verde-oliva text-white'
                      : 'bg-cinza-muito-claro text-cinza-escuro hover:bg-verde-claro/20'
                  }`}
                >
                  R${valor}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-cinza-medio">Outro valor:</span>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cinza-medio">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorCustom}
                  onChange={handleCustomChange}
                  className="w-full pl-10 pr-4 py-2 border border-cinza-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-oliva/50"
                />
              </div>
            </div>
            {valorAtual !== null && valorAtual < 1 && valorAtual > 0 && (
              <p className="text-sm text-erro mt-2">Valor mínimo: R$ 1,00</p>
            )}
          </div>

          <div className="border-t border-cinza-claro pt-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-cinza-escuro">
                Valor: <span className="text-verde-oliva">R$ {valorAtual?.toFixed(2) || '0,00'}</span>
              </p>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-white border border-cinza-claro rounded-xl p-4 mb-3">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>
              <p className="text-xs text-cinza-medio">
                Escaneie o QR Code com o app do seu banco
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-cinza-medio text-center">
                Ou copie o código Pix
              </label>
              <div className="bg-off-white border border-cinza-claro rounded-lg p-3">
                <p className="text-xs text-cinza-escuro font-mono break-all leading-relaxed max-h-20 overflow-y-auto">
                  {pixCopiaECola}
                </p>
              </div>
              <button
                onClick={handleCopy}
                disabled={!pixCopiaECola}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-sucesso text-white'
                    : 'bg-verde-oliva text-white hover:bg-verde-claro'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar código Pix
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-verde-claro/10 border border-verde-claro/30 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-verde-oliva mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Como sua doação ajuda
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {beneficios.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-verde-oliva/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-verde-oliva" />
                </div>
                <div>
                  <p className="font-medium text-cinza-escuro text-sm">{item.title}</p>
                  <p className="text-xs text-cinza-medio">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-cinza-medio">
          <p className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Dúvidas sobre doações?{' '}
            <a 
              href="mailto:ouvidoria@abracanm.org.br"
              className="text-verde-oliva hover:underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>

      <footer className="bg-cinza-escuro text-off-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-off-white/80 text-sm">
            ABRACANM - Associação Brasileira de Cannabis Medicinal
          </p>
          <p className="text-off-white/60 text-xs mt-2">
            Juntos pela qualidade de vida através da ciência
          </p>
        </div>
      </footer>
    </main>
  );
}
