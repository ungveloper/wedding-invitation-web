import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import InvitationAdmin from '@/app/components/admin/InvitationAdmin';
import InvitationBlocked from '@/app/components/template/InvitationBlocked';
import InvitationRenderer, {
  isTemplateImplemented,
} from '@/app/components/template/InvitationRenderer';
import { getSessionUser } from '@/app/lib/auth/session';
import {
  getAllowedPublishedTemplateIds,
  getDashboardData,
  getInvitation,
  listTemplates,
  selectRandomTemplateId,
} from '@/app/lib/invitations/repository';

type InvitationRootPageProps = {
  params: Promise<{ invitationId: string }>;
};

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mocheong.com').replace(
    /\/$/,
    '',
  );
}

export async function generateMetadata({
  params,
}: InvitationRootPageProps): Promise<Metadata> {
  const { invitationId } = await params;
  const invitation = await getInvitation(invitationId);

  if (!invitation) {
    return { title: '청첩장을 찾을 수 없습니다 | 모청모청' };
  }

  const url = `${getSiteUrl()}/${invitation.slug}`;

  return {
    title: invitation.metadata.title,
    description: invitation.metadata.description,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url,
      siteName: invitation.metadata.siteName,
      title: invitation.metadata.title,
      description: invitation.metadata.description,
      images: [{ url: invitation.metadata.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: invitation.metadata.title,
      description: invitation.metadata.description,
      images: [invitation.metadata.ogImage],
    },
  };
}

export default async function InvitationRootPage({
  params,
}: InvitationRootPageProps): Promise<React.ReactElement> {
  const { invitationId } = await params;
  const [invitation, sessionUser] = await Promise.all([
    getInvitation(invitationId),
    getSessionUser(),
  ]);

  if (!invitation) {
    notFound();
  }

  const isOwner = Boolean(
    sessionUser?.email &&
      sessionUser.email.toLowerCase() === invitation.ownerEmail.toLowerCase(),
  );

  if (isOwner && sessionUser?.email) {
    const dashboard = await getDashboardData(invitation.slug, sessionUser.email);

    if (!dashboard) {
      notFound();
    }

    return (
      <InvitationAdmin dashboard={dashboard} ownerEmail={sessionUser.email} />
    );
  }

  if (invitation.status === 'archived') {
    return <InvitationBlocked invitationId={invitation.slug} />;
  }

  const templates = await listTemplates();
  const allowedTemplateIds = getAllowedPublishedTemplateIds(
    invitation,
    templates,
  ).filter(isTemplateImplemented);
  const selectedTemplateId = selectRandomTemplateId(allowedTemplateIds);

  if (!selectedTemplateId || invitation.settings.rootAccessMode === 'blocked') {
    return <InvitationBlocked invitationId={invitation.slug} />;
  }

  if (invitation.settings.rootAccessMode === 'redirect-random') {
    redirect(`/${invitation.slug}/${selectedTemplateId}`);
  }

  return (
    <InvitationRenderer
      invitation={invitation}
      templateId={selectedTemplateId}
      invitationUrl={`${getSiteUrl()}/${invitation.slug}`}
    />
  );
}
