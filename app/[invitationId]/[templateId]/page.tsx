import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import InvitationRenderer, {
  isTemplateImplemented,
} from '@/app/components/template/InvitationRenderer';
import {
  getInvitation,
  getTemplateDefinition,
} from '@/app/lib/invitations/repository';

type InvitationTemplatePageProps = {
  params: Promise<{ invitationId: string; templateId: string }>;
};

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mocheong.com').replace(
    /\/$/,
    '',
  );
}

export async function generateMetadata({
  params,
}: InvitationTemplatePageProps): Promise<Metadata> {
  const { invitationId, templateId } = await params;
  const invitation = await getInvitation(invitationId);

  if (!invitation) {
    return { title: '청첩장을 찾을 수 없습니다 | 모청모청' };
  }

  const url = `${getSiteUrl()}/${invitation.slug}/${templateId}`;

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

export default async function InvitationTemplatePage({
  params,
}: InvitationTemplatePageProps): Promise<React.ReactElement> {
  const { invitationId, templateId: templateIdParam } = await params;
  const invitation = await getInvitation(invitationId);

  if (!invitation) {
    notFound();
  }

  if (!/^\d+$/.test(templateIdParam)) {
    redirect(`/${invitation.slug}`);
  }

  const templateId = Number(templateIdParam);
  const template = await getTemplateDefinition(templateId);
  const isAllowed = invitation.settings.allowedTemplateIds.includes(templateId);

  if (
    !Number.isSafeInteger(templateId) ||
    templateId < 1 ||
    !template ||
    !template.published ||
    !isTemplateImplemented(templateId) ||
    !isAllowed ||
    invitation.status === 'archived'
  ) {
    redirect(`/${invitation.slug}`);
  }

  return (
    <InvitationRenderer
      invitation={invitation}
      templateId={templateId}
      invitationUrl={`${getSiteUrl()}/${invitation.slug}/${templateId}`}
    />
  );
}
