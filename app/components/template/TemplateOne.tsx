'use client';

import { useCallback, useState } from 'react';
import Cover from '@/app/Cover';
import Greeting from '@/app/Greeting';
import Signoff from '@/app/Signoff';
import BackgroundMusic from '@/app/components/background-music/BackgroundMusic';
import FadeInUp from '@/app/components/common/FadeInUp';
import Intro from '@/app/components/intro/Intro';
import OpeningVideo from '@/app/components/opening-video/OpeningVideo';
import WeddingAccounts from '@/app/components/wedding-accounts/WeddingAccounts';
import WeddingCalendar from '@/app/components/wedding-calendar/WeddingCalendar';
import WeddingGallery from '@/app/components/wedding-gallery/WeddingGallery';
import WeddingGuestbook from '@/app/components/wedding-guestbook/WeddingGuestbook';
import WeddingLocation from '@/app/components/wedding-location/WeddingLocation';
import WeddingRsvp from '@/app/components/wedding-rsvp/WeddingRsvp';
import VisitorTracker from '@/app/components/analytics/VisitorTracker';
import type { InvitationData } from '@/app/types/invitation';

type TemplateOneProps = {
  invitation: InvitationData;
  invitationUrl: string;
  templateId: number;
};

export default function TemplateOne({
  invitation,
  invitationUrl,
  templateId,
}: TemplateOneProps): React.ReactElement {
  const [shouldPlayOpeningVideo, setShouldPlayOpeningVideo] = useState(false);
  const [isOpeningVideoActive, setIsOpeningVideoActive] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const { content, couple, event } = invitation;

  const handleBeforeIntroOpen = useCallback(() => {
    setShouldPlayOpeningVideo(true);
  }, []);

  const handleIntroOpen = useCallback(() => {
    setIsOpeningVideoActive(true);
  }, []);

  const handleOpeningVideoFinish = useCallback(() => {
    setIsOpeningVideoActive(false);
    setIsContentReady(true);
  }, []);

  return (
    <>
      <VisitorTracker invitationId={invitation.slug} templateId={templateId} />

      <BackgroundMusic
        variant={content.backgroundMusic.variant}
        src={content.backgroundMusic.src}
        autoPlay={content.backgroundMusic.autoPlay}
        loop={content.backgroundMusic.loop}
        volume={content.backgroundMusic.volume}
        showControl={content.backgroundMusic.showControl}
      />

      <main className="mx-auto flex w-full max-w-md flex-col min-[449px]:border-x min-[449px]:border-[#e5e5e5]">
        <Intro
          variant={content.intro.variant}
          duration={content.intro.duration}
          delay={content.intro.delay}
          autoOpen={content.intro.autoOpen}
          lockScroll={content.intro.lockScroll}
          eyebrow={content.intro.eyebrow}
          title={content.intro.title}
          openLabel={content.intro.openLabel}
          preOpenOffset={content.intro.preOpenOffset}
          onBeforeOpen={handleBeforeIntroOpen}
          onOpen={handleIntroOpen}
        />

        {isContentReady ? (
          <>
            <FadeInUp>
              <Cover
                photoSrc={content.cover.photoSrc}
                statement={content.cover.statement}
                date={content.cover.date}
                groomLabel={content.cover.groomLabel}
                brideLabel={content.cover.brideLabel}
              />
            </FadeInUp>

            <Greeting
              quote={content.greeting.quote}
              quoteSource={content.greeting.quoteSource}
              messages={content.greeting.messages}
              groomParentsLabel={content.greeting.family.groomParentsLabel}
              groomRelationLabel={couple.groom.relationLabel}
              groomName={couple.groom.name}
              brideParentsLabel={content.greeting.family.brideParentsLabel}
              brideRelationLabel={couple.bride.relationLabel}
              brideName={couple.bride.name}
            />

            {content.calendar.enabled ? (
              <WeddingCalendar
                targetDate={event.dateTime}
                groomName={couple.groom.name}
                brideName={couple.bride.name}
              />
            ) : null}

            <WeddingGallery
              title={content.gallery.title}
              images={content.gallery.images}
            />

            <WeddingLocation
              title={content.location.title}
              venueName={event.venueName}
              hallName={event.hallName}
              address={event.address}
              latitude={event.latitude}
              longitude={event.longitude}
              mapLinks={content.location.mapLinks}
            />

            {content.accounts.enabled ? (
              <WeddingAccounts
                title={content.accounts.title}
                groomSectionTitle={content.accounts.groomSectionTitle}
                brideSectionTitle={content.accounts.brideSectionTitle}
                groomAccounts={content.accounts.groom}
                brideAccounts={content.accounts.bride}
              />
            ) : null}

            {content.rsvp.enabled ? (
              <WeddingRsvp
                invitationId={invitation.slug}
                title={content.rsvp.title}
                descriptionLines={content.rsvp.descriptionLines}
                submitLabel={content.rsvp.submitLabel}
                groomName={couple.groom.name}
                brideName={couple.bride.name}
                month={event.month}
                day={event.day}
                dayOfWeek={event.dayOfWeek}
                time={event.timeLabel}
                venueName={event.venueName}
                hallName={event.hallName}
              />
            ) : null}

            {content.guestbook.enabled ? (
              <WeddingGuestbook
                invitationId={invitation.slug}
                title={content.guestbook.title}
                description={content.guestbook.description}
                submitLabel={content.guestbook.submitLabel}
              />
            ) : null}

            <Signoff
              invitationUrl={invitationUrl}
              imageSrc={content.signoff.imageSrc}
              imageAlt={content.signoff.imageAlt}
              kakaoTitle={content.signoff.kakaoTitle}
              kakaoDescription={content.signoff.kakaoDescription}
              kakaoImage={content.signoff.kakaoImage}
              kakaoButtonLabel={content.signoff.kakaoButtonLabel}
              shareButtonLabel={content.signoff.shareButtonLabel}
              copyButtonLabel={content.signoff.copyButtonLabel}
            />
          </>
        ) : null}
      </main>

      {!isContentReady ? (
        <OpeningVideo
          src={content.intro.openingVideoSrc}
          shouldPlay={shouldPlayOpeningVideo}
          isActive={isOpeningVideoActive}
          onFinish={handleOpeningVideoFinish}
        />
      ) : null}
    </>
  );
}
