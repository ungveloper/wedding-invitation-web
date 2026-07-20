'use client';

import { useEffect } from 'react';

type VisitorTrackerProps = {
  invitationId: string;
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

export default function VisitorTracker({
  invitationId,
}: VisitorTrackerProps): null {
  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/invitations/${invitationId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId() }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // 방문자 집계 실패는 청첩장 열람을 방해하지 않습니다.
    });

    return () => controller.abort();
  }, [invitationId]);

  return null;
}
