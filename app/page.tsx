import { redirect } from 'next/navigation';
import LandingPage from './components/landing/LandingPage';

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({
  searchParams,
}: HomeProps): Promise<React.ReactElement> {
  const values = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (typeof value === 'string') {
      query.set(key, value);
    }
  }

  const queryString = query.toString();

  // 임시 처리 (2026-07-20 15:28 KST): 모청 생성 기능을 구현하기 전까지
  // 루트 방문자 집계 API에서 쿠키와 유입 정보를 기록한 후 0920 청첩장 1번 시안으로 서버 리다이렉트합니다.
  redirect(`/api/analytics/site-entry${queryString ? `?${queryString}` : ''}`);

  return <LandingPage />;
}
