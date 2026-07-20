import TemplateOne from './TemplateOne';
import type { InvitationData } from '@/app/types/invitation';

export function isTemplateImplemented(templateId: number): boolean {
  return templateId === 1;
}

type InvitationRendererProps = {
  invitation: InvitationData;
  templateId: number;
  invitationUrl: string;
};

export default function InvitationRenderer({
  invitation,
  templateId,
  invitationUrl,
}: InvitationRendererProps): React.ReactElement | null {
  switch (templateId) {
    case 1:
      return (
        <TemplateOne invitation={invitation} invitationUrl={invitationUrl} />
      );
    default:
      return null;
  }
}
