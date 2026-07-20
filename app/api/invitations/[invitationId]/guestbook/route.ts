import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/app/lib/http';
import {
  createGuestbookEntry,
  listPublicGuestbookEntries,
} from '@/app/lib/invitations/repository';
import { assertSameOrigin } from '@/app/lib/security';

type RouteContext = {
  params: Promise<{ invitationId: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { invitationId } = await context.params;
    const entries = await listPublicGuestbookEntries(invitationId);

    return NextResponse.json({ entries });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { invitationId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    await createGuestbookEntry(invitationId, {
      name: body.name,
      message: body.message,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
