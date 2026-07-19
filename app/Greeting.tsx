import FadeInUp from './components/common/FadeInUp';
import WeddingRibbon from './components/common/WeddingRibbon';
import HeartImage from './components/heart-image/HeartImage';
import { GowunDodum } from './lib/fonts';

const greetingMessages = [
  {
    id: 1,
    text: '서로를 만나기 전보다',
  },
  {
    id: 2,
    text: '더 나은 내일을 꿈꾸게 되었습니다.',
  },
  {
    id: 3,
    text: '부족한 부분을 채워주고,',
  },
  {
    id: 4,
    text: '잘하는 부분은 아낌없이 응원하며',
  },
  {
    id: 5,
    text: '매일 조금씩 더 좋은 사람이 되어',
  },
  {
    id: 6,
    text: '곁을 지키겠습니다.',
  },
  {
    id: 7,
    text: '저희 두 사람이 하나로 거듭나는 날,',
  },
  {
    id: 8,
    text: '함께해 주시길 바랍니다.',
  },
];

export default function Greeting(): React.ReactElement {
  return (
    <section
      className={`mt-14 flex flex-col items-center ${GowunDodum.className}`}
    >
      <FadeInUp>
        <WeddingRibbon />

        <div className="mt-8 text-center">
          <p>“당신은 내가 더 좋은 사람이 되고 싶게 만들어요.”</p>
          <p className="mt-2">- 영화 〈이보다 더 좋을 순 없다〉 -</p>
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="mx-auto my-10 w-[20vw] h-px bg-[repeating-linear-gradient(to_right,#999_0_4px,transparent_4px_10px)] bg-size-[100%_2px] bg-bottom bg-no-repeat" />
      </FadeInUp>

      <FadeInUp>
        <div className="px-5 w-full space-y-1.5 text-center text-[17px]">
          {greetingMessages.map((message) => (
            <p
              key={message.id}
              className={[
                message.id >= 8 ? 'opacity-100' : 'opacity-80',
                message.id === 2 || message.id === 6 ? 'mb-6' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {message.text}
            </p>
          ))}
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="mx-auto mt-14 py-5 w-[66.6%] border-y border-y-gray-200">
          <div className="grid grid-cols-[auto_auto_auto] justify-center items-center gap-x-4 gap-y-3 text-[17px]">
            <p className="justify-self-center">
              <span>지정호</span>·<span>박순영</span>의
            </p>
            <p className="justify-self-center text-sm">아들</p>
            <p>웅재</p>
            <p className="justify-self-center">
              <span>송종무</span>·<span>지경화</span>의
            </p>
            <p className="justify-self-center text-sm">딸</p>
            <p>혜정</p>
          </div>
        </div>
      </FadeInUp>

      <HeartImage />
    </section>
  );
}
