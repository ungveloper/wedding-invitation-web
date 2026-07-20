import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUser } from '@/app/lib/auth/session';
import { jsonError } from '@/app/lib/http';
import { updateInvitationSettings } from '@/app/lib/invitations/repository';
import { assertSameOrigin } from '@/app/lib/security';
import type { RootAccessMode } from '@/app/types/invitation';

type RouteContext = {
  params: Promise<{ invitationId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();

    if (!user.email) {
      throw new Error('UNAUTHENTICATED');
    }

    const { invitationId } = await context.params;
    const body = (await request.json()) as {
      allowedTemplateIds?: unknown;
      rootAccessMode?: unknown;
    };
    const allowedTemplateIds = Array.isArray(body.allowedTemplateIds)
      ? body.allowedTemplateIds.map(Number)
      : [];
    const rootAccessMode = String(body.rootAccessMode) as RootAccessMode;

    await updateInvitationSettings(invitationId, user.email, {
      allowedTemplateIds,
      rootAccessMode,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
