import { useEffect, useRef, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import type { RequestLogEntry } from '@/services/RequestLogService';
import { useAuthStore } from '@/stores/useAuthStore';

export type StreamStatus = 'connecting' | 'open' | 'closed' | 'error';

interface UseRequestLogStreamResult {
  status: StreamStatus;
  /** Called once per incoming STOMP message. */
  onLog: (cb: (entry: RequestLogEntry) => void) => void;
}

/**
 * Connects to the backend STOMP endpoint at `/ws` and subscribes to
 * `/topic/request-logs`. Authentication is provided via the JWT stored in
 * the auth store, forwarded both as a native STOMP header and as the
 * `?token=...` query param (the latter is required for the SockJS
 * handshake, which cannot set custom headers).
 *
 * The hook owns exactly one STOMP client for the lifetime of the
 * component using it; reconnects with exponential back-off up to 30s.
 */
export function useRequestLogStream(): UseRequestLogStreamResult {
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const listenersRef = useRef<Set<(entry: RequestLogEntry) => void>>(new Set());
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) {
      setStatus('closed');
      return;
    }

    const baseHttp = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
      .replace(/\/api\/?$/, '');
    const wsUrl = `${baseHttp}/ws?token=${encodeURIComponent(token)}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: () => {},
      onConnect: () => {
        setStatus('open');
        client.subscribe('/topic/request-logs', (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body) as RequestLogEntry;
            listenersRef.current.forEach((cb) => cb(body));
          } catch {
            // ignore malformed payload
          }
        });
      },
      onWebSocketClose: () => setStatus('closed'),
      onStompError: () => setStatus('error'),
      onWebSocketError: () => setStatus('error'),
    });

    client.activate();
    clientRef.current = client;
    setStatus('connecting');

    return () => {
      client.deactivate();
      clientRef.current = null;
      setStatus('closed');
    };
  }, []);

  const onLog = (cb: (entry: RequestLogEntry) => void) => {
    listenersRef.current.add(cb);
  };

  return { status, onLog };
}
