import Handwriting from './components/handwriting/Handwriting';

export default function Home() {
  return (
    <main className="bg-[#f4eee5] text-[#75665d]">
      <section className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#8b7b70]">
            Variant: gettingMarried
          </p>

          <Handwriting
            variant="gettingMarried"
            className="mx-auto max-w-3xl"
            color="#d97e9f"
            duration={8}
            delay={0.2}
            threshold={0.15}
          />
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#8b7b70]">
            Variant: ourWeddingDay
          </p>

          <Handwriting
            variant="ourWeddingDay"
            className="mx-auto max-w-3xl"
            color="#d97e9f"
            duration={6}
            delay={0.2}
            threshold={0.15}
          />
        </div>
      </section>
    </main>
  );
}
