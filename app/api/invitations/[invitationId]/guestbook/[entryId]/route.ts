import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUser } from '@/app/lib/auth/session';
import { jsonError } from '@/app/lib/http';
import {
  deleteGuestbookEntry,
  setGuestbookEntryHidden,
} from '@/app/lib/invitations/repository';
import { assertSameOrigin } from '@/app/lib/security';

type RouteContext = {
  params: Promise<{ invitationId: string; entryId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();

    if (!user.email) {
      throw new Error('UNAUTHENTICATED');
    }

    const { invitationId, entryId } = await context.params;
    const body = (await request.json()) as { isHidden?: unknown };

    await setGuestbookEntryHidden(
      invitationId,
      entryId,
      user.email,
      Boolean(body.isHidden),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();

    if (!user.email) {
      throw new Error('UNAUTHENTICATED');
    }

    const { invitationId, entryId } = await context.params;

    await deleteGuestbookEntry(invitationId, entryId, user.email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
