'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, VideoOff } from 'lucide-react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  onClose?: () => void;
  onReady?: () => void;
}

export default function JitsiMeet({ 
  roomName, 
  displayName, 
  onClose, 
  onReady,
}: JitsiMeetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Falha ao carregar Jitsi'));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        const domain = 'meet.jit.si';
        const options = {
          roomName: `abracanm-consulta-${roomName}`,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: displayName,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            enableClosePage: false,
            disableInviteFunctions: true,
            enableLobbyChat: false,
            hideLobbyButton: true,
            requireDisplayName: false,
            enableInsecureRoomNameWarning: false,
            disableModeratorIndicator: true,
            enableNoisyMicDetection: false,
            toolbarButtons: [
              'microphone',
              'camera',
              'desktop',
              'fullscreen',
              'hangup',
              'chat',
              'settings',
              'videoquality',
              'tileview',
            ],
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'fullscreen',
              'hangup',
              'chat',
              'settings',
              'videoquality',
              'tileview',
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        apiRef.current.addListener('videoConferenceJoined', () => {
          setLoading(false);
          onReady?.();
        });

        apiRef.current.addListener('videoConferenceLeft', () => {
          onClose?.();
        });

        apiRef.current.addListener('readyToClose', () => {
          onClose?.();
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao iniciar videochamada');
        setLoading(false);
      }
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, displayName, onClose, onReady]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <VideoOff className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro na Videochamada</h2>
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

  return (
    <div className="relative w-full h-full bg-gray-900">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <Loader2 className="w-12 h-12 text-verde-claro animate-spin mb-4" />
          <p className="text-white text-lg">Conectando à videochamada...</p>
          <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      )}
      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
