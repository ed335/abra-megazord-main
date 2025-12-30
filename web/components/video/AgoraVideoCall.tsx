'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, VideoOff } from 'lucide-react';

const AgoraUIKit = dynamic(() => import('agora-react-uikit'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <Loader2 className="w-8 h-8 text-verde-claro animate-spin" />
    </div>
  )
});

interface AgoraVideoCallProps {
  channelName: string;
  displayName: string;
  onClose?: () => void;
  onReady?: () => void;
}

export default function AgoraVideoCall({ 
  channelName, 
  displayName, 
  onClose,
  onReady 
}: AgoraVideoCallProps) {
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName }),
      });

      if (!response.ok) {
        throw new Error('Falha ao obter token');
      }

      const data = await response.json();
      setToken(data.token);
      setInCall(true);
      onReady?.();
    } catch (err) {
      console.error('Erro ao buscar token:', err);
      setError('Erro ao conectar na videochamada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [channelName, onReady]);

  useEffect(() => {
    if (!appId) {
      setError('AGORA_APP_ID não configurado.');
      setLoading(false);
      return;
    }
    fetchToken();
  }, [appId, fetchToken]);

  const handleEndCall = () => {
    setInCall(false);
    onClose?.();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 text-verde-claro animate-spin mb-4" />
        <p className="text-gray-400">Conectando à videochamada...</p>
      </div>
    );
  }

  if (error || !appId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <VideoOff className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro na Conexão</h2>
        <p className="text-gray-400 text-center mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!inCall || !token) {
    return null;
  }

  const rtcProps = {
    appId: appId,
    channel: channelName,
    token: token,
    uid: 0,
    role: 'host' as const,
    enableVideo: true,
    enableAudio: true,
  };

  const callbacks = {
    EndCall: handleEndCall,
  };

  const styleProps = {
    localBtnContainer: {
      backgroundColor: '#1a1a1a',
      borderTop: '1px solid #333',
    },
    localBtnStyles: {
      muteLocalAudio: { backgroundColor: '#333' },
      muteLocalVideo: { backgroundColor: '#333' },
      endCall: { backgroundColor: '#dc2626' },
    },
    theme: '#6B8E23',
  };

  return (
    <div className="h-full w-full bg-gray-900" data-participant={displayName}>
      <AgoraUIKit
        rtcProps={rtcProps}
        callbacks={callbacks}
        styleProps={styleProps}
      />
    </div>
  );
}
