import Cover from './Cover';
import Greeting from './Greeting';
import Signoff from './Signoff';
import Intro from './components/intro/Intro';
import WeddingAccounts from './components/wedding-accounts/WeddingAccounts';
import WeddingCalendar from './components/wedding-calendar/WeddingCalendar';
import WeddingGallery from './components/wedding-gallery/WeddingGallery';
import WeddingLocation from './components/wedding-location/WeddingLocation';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex flex-col">
      <Intro
        variant="curtain"
        duration={1.45}
        delay={0.2}
        autoOpen
        eyebrow="Wedding"
        title="Invitation"
        openLabel="터치하여 열기"
      />

      <Cover />

      <Greeting />

      <WeddingCalendar
        targetDate="2026-09-20T12:00:00+09:00"
        groomName="지웅재"
        brideName="송혜정"
      />

      <WeddingLocation
        venueName="W웨딩 국민연금웨딩홀"
        hallName="3층 에메랄드홀"
        address="부산 연제구 중앙대로 1000"
        latitude={35.1778497}
        longitude={129.0756194}
      />

      <WeddingGallery />

      <WeddingAccounts />

      <Signoff />
    </main>
  );
}
