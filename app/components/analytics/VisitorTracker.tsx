'use client';

import { useEffect } from 'react';

type VisitorTrackerProps = {
  invitationId: string;
  templateId: number;
};

const VISITOR_STORAGE_KEY = 'mocheong_visitor_id';

function createVisitorId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);

    if (existing) {
      return existing;
    }

    const value = createVisitorId();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, value);
    return value;
  } catch {
    return createVisitorId();
  }
}

function getConnectionType(): string {
  const navigatorWithConnection = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      type?: string;
    };
  };

  return (
    navigatorWithConnection.connection?.effectiveType ??
    navigatorWithConnection.connection?.type ??
    ''
  );
}

function getDeviceMemory(): number | null {
  const navigatorWithMemory = navigator as Navigator & {
    deviceMemory?: number;
  };
  const value = navigatorWithMemory.deviceMemory;

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export default function VisitorTracker({
  invitationId,
  templateId,
}: VisitorTrackerProps): null {
  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/invitations/${invitationId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        templateId,
        pagePath: window.location.pathname,
        pageUrl: window.location.href,
        referrer: document.referrer,
        language: navigator.language,
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        colorDepth: window.screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: getDeviceMemory(),
        connectionType: getConnectionType(),
        platform: navigator.platform,
      }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // 방문자 집계 실패는 청첩장 열람을 방해하지 않습니다.
    });

    return () => controller.abort();
  }, [invitationId, templateId]);

  return null;
}
