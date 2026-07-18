import Cover from './Cover';
import Intro from './components/intro/Intro';

export default function Home() {
  return (
    <main className="mx-auto max-w-md w-full">
      <Intro
        variant="curtain"
        duration={1.45}
        delay={0.2}
        autoOpen
        eyebrow="Wedding"
        title="Invitation"
        openLabel="터치하여 열기"
      >
        <Cover />
      </Intro>

      <div className="h-[300vh]"></div>
    </main>
  );
}
