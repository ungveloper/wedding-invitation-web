import { NextRequest, NextResponse } from 'next/server';
import { invitationSlugExists } from '@/app/lib/invitations/repository';
import { jsonError } from '@/app/lib/http';
import {
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const slug = normalizeInvitationSlug(
      request.nextUrl.searchParams.get('slug') ?? '',
    );

    if (!isValidInvitationSlug(slug)) {
      return NextResponse.json({
        slug,
        valid: false,
        available: false,
        message: '영문 소문자, 숫자, 하이픈으로 3~32자 입력하세요.',
      });
    }

    const exists = await invitationSlugExists(slug);

    return NextResponse.json({
      slug,
      valid: true,
      available: !exists,
      message: exists ? '이미 사용 중인 주소입니다.' : '사용 가능한 주소입니다.',
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
