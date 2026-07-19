'use client';

import { useCallback, useState } from 'react';
import Cover from './Cover';
import Greeting from './Greeting';
import Signoff from './Signoff';
import BackgroundMusic from './components/background-music/BackgroundMusic';
import FadeInUp from './components/common/FadeInUp';
import Intro from './components/intro/Intro';
import OpeningVideo from './components/opening-video/OpeningVideo';
import WeddingAccounts from './components/wedding-accounts/WeddingAccounts';
import WeddingCalendar from './components/wedding-calendar/WeddingCalendar';
import WeddingGallery from './components/wedding-gallery/WeddingGallery';
import WeddingLocation from './components/wedding-location/WeddingLocation';

export default function Home(): React.ReactElement {
  const [shouldPlayOpeningVideo, setShouldPlayOpeningVideo] = useState(false);
  const [isOpeningVideoActive, setIsOpeningVideoActive] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);

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
      <BackgroundMusic variant="wedding" />

      <main className="mx-auto flex w-full max-w-md flex-col min-[449px]:border-x min-[449px]:border-[#e5e5e5]">
        <Intro
          variant="curtain"
          duration={1.45}
          delay={0.2}
          autoOpen
          lockScroll={false}
          eyebrow="Wedding"
          title="Invitation"
          openLabel="터치하여 열기"
          preOpenOffset={1}
          onBeforeOpen={handleBeforeIntroOpen}
          onOpen={handleIntroOpen}
        />

        {isContentReady ? (
          <>
            <FadeInUp>
              <Cover />
            </FadeInUp>

            <Greeting />

            <WeddingCalendar
              targetDate="2026-09-20T12:00:00+09:00"
              groomName="웅재"
              brideName="혜정"
            />

            <WeddingGallery />

            <WeddingLocation
              venueName="W웨딩 국민연금웨딩홀"
              hallName="3층 에메랄드홀"
              address="부산 연제구 중앙대로 1000"
              latitude={35.1778497}
              longitude={129.0756194}
            />

            <WeddingAccounts />

            {/* 
            <WeddingRsvp
              groomName="웅재"
              brideName="혜정"
              month={9}
              day={20}
              dayOfWeek="일요일"
              time="오후 12시"
              venueName="W웨딩 국민연금웨딩홀"
              hallName="3층 에메랄드홀"
              formUrl="https://jealous-growth-583.notion.site/ebd//3a27f0af97c280549aaef662fc987fca"
            />
             */}

            <Signoff />
          </>
        ) : null}
      </main>

      {!isContentReady ? (
        <OpeningVideo
          shouldPlay={shouldPlayOpeningVideo}
          isActive={isOpeningVideoActive}
          onFinish={handleOpeningVideoFinish}
        />
      ) : null}
    </>
  );
}
