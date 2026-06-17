import { useEffect, useRef } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useAnnouncementStore } from '@/stores/useAnnouncementStore';
import type { SystemAnnouncement } from '@/pages/training-manager/types';

interface AnnouncementEvent {
  type: 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
  announcement?: SystemAnnouncement;
  announcementId?: string;
}

/**
 * Subscribes to the global {@code /topic/announcements} STOMP topic. Any
 * authenticated user (not just admins) can listen, so announcement pages and
 * the dashboard automatically refresh whenever a training manager publishes
 * or archives an announcement.
 */
export function useAnnouncementStream() {
  const token = useAuthStore((s) => s.token);
  const applyEvent = useAnnouncementStore((s) => s.applyEvent);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const baseHttp = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
    const wsUrl = `${baseHttp}/ws?token=${encodeURIComponent(token)}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: () => {},
      onConnect: () => {
        client.subscribe('/topic/announcements', (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body) as AnnouncementEvent;
            if (!body || !body.type) return;
            if (body.type === 'DELETED') {
              if (body.announcementId) {
                applyEvent('DELETED', { announcementId: body.announcementId });
              }
              return;
            }
            if (body.announcement && body.announcement.announcementId) {
              applyEvent(body.type, body.announcement);
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
  }, [token, applyEvent]);
}
