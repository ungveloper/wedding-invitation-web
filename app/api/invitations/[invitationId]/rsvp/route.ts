import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/app/lib/http';
import { createRsvp } from '@/app/lib/invitations/repository';
import { assertSameOrigin } from '@/app/lib/security';

type RouteContext = {
  params: Promise<{ invitationId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { invitationId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    await createRsvp(invitationId, {
      name: body.name,
      side: body.side,
      attendance: body.attendance,
      guestCount: body.guestCount,
      meal: body.meal,
      phone: body.phone,
      message: body.message,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
