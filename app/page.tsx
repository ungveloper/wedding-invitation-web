import Cover from './Cover';
import Intro from './components/intro/Intro';

export default function Home() {
  return (
    <main className="mx-auto max-w-md w-full">
      <Intro
        variant="curtain"
        duration={1.45}
        eyebrow="Wedding"
        title="Invitation"
        openLabel="터치하여 열기"
      >
        <Cover />
      </Intro>
    </main>
  );
}
