import { useEffect, useRef } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore, type NotificationItem } from '@/stores/useNotificationStore';

interface IncomingUnreadCount {
  type: 'unread-count';
  count: number;
}

type Incoming = NotificationItem | IncomingUnreadCount;

/**
 * Connects to the backend STOMP endpoint and subscribes to the current user's
 * notification queue. Two payload shapes are accepted:
 *   - a serialized Notification entity (new notification created)
 *   - { type: 'unread-count', count } (server-side count update, e.g. on markAsRead)
 *
 * The hook is idempotent and reuses a single STOMP client per session. It
 * auto-disconnects when the user logs out.
 */
export function useNotificationStream() {
  const token = useAuthStore((s) => s.token);
  const applyIncoming = useNotificationStore((s) => s.applyIncoming);
  const applyUnreadCount = useNotificationStore((s) => s.applyUnreadCount);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const baseHttp = (process.env.VITE_API_URL || `${process.env.VITE_API_URL || 'http://localhost:8080/api'}`).replace(/\/api\/?$/, '');
    const wsUrl = `${baseHttp}/ws?token=${encodeURIComponent(token)}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: () => {},
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body) as Incoming;
            if (body && typeof body === 'object' && 'type' in body && body.type === 'unread-count') {
              applyUnreadCount((body as IncomingUnreadCount).count);
            } else {
              applyIncoming(body as NotificationItem);
            }
          } catch {
            // ignore malformed payload
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [token, applyIncoming, applyUnreadCount]);
}
