import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <p className="text-sm font-bold tracking-[0.14em] text-rose-500">모청모청</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          청첩장을 찾을 수 없습니다.
        </h1>
        <p className="mt-3 leading-7 text-slate-500">
          주소가 정확한지 확인하거나 청첩장 소유자에게 문의해 주세요.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
        >
          모청모청 홈으로
        </Link>
      </section>
    </main>
  );
}
