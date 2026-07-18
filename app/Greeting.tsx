import Image from 'next/image';
import { ChosunNm, GowunDodum } from './lib/fonts';
import Divider from './Divider';

const greetingMessages = [
  {
    id: 1,
    text: '잡은 손의 온기가 서로의 마음을',
  },
  {
    id: 2,
    text: '가장 먼저 알아채는 사람이 되겠습니다.',
  },
  {
    id: 3,
    text: '좋은 날에는 그 손을 흔들며 함께 웃고,',
  },
  {
    id: 4,
    text: '고단한 날에는 더 꽉 맞잡아',
  },
  {
    id: 5,
    text: '서로의 무게를 나누어 짊어지겠습니다.',
  },
  {
    id: 6,
    text: '어떤 풍경 속에서도',
  },
  {
    id: 7,
    text: '결코 이 손을 놓지 않겠다는 약속,',
  },
  {
    id: 8,
    text: '저희 두 사람의 눈부신 시작에',
  },
  {
    id: 9,
    text: '다정한 증인이 되어주세요.',
  },
];

export default function Greeting(): React.ReactElement {
  return (
    <section
      className={`mt-14 flex pb-14 flex-col items-center ${GowunDodum.className}`}
    >
      <Image
        src="/images/message/decoration_ribbon.png"
        alt="장식 리본"
        width={134}
        height={40}
      />

      <div className="mt-8 text-center">
        <p>“예쁜 예감이 들었다.</p>
        <p>우리는 언제나 손을 잡고 있게 될 것이다.”</p>
        <p className="mt-2">이이체, 〈연인〉 中</p>
      </div>

      <div className="my-10 w-[20vw] h-px bg-[repeating-linear-gradient(to_right,#999_0_4px,transparent_4px_10px)] bg-size-[100%_2px] bg-bottom bg-no-repeat" />

      <div className="px-5 w-full space-y-1.5 text-center text-[17px]">
        {greetingMessages.map((message) => (
          <p
            key={message.id}
            className={message.id >= 8 ? 'font-bold opacity-80' : ''}
          >
            {message.text}
          </p>
        ))}
      </div>

      <Divider />

      <div
        className={`px-3 w-full grid grid-cols-2 gap-x-3 ${GowunDodum.className}`}
      >
        {/* 신랑 */}
        <div>
          <div className="relative w-full aspect-square rounded-md overflow-clip shadow-md">
            <Image src={`/images/profiles/groom.png`} alt="groom" fill />
          </div>

          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="flex justify-center items-end gap-1">
              <span>신랑</span>
              <p className="font-bold text-lg">지웅재</p>
            </div>
            <p className="text-sm">지정호·박순영의 장남</p>
          </div>
        </div>

        {/* 신부 */}
        <div>
          <div className="relative w-full aspect-square rounded-md overflow-clip shadow-md">
            <Image src={`/images/profiles/bride.png`} alt="bride" fill />
          </div>

          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="flex justify-center items-end gap-1">
              <span>신부</span>
              <p className="font-bold text-lg">송혜정</p>
            </div>
            <p className="text-sm">송종무·지경화의 차녀</p>
          </div>
        </div>
      </div>
    </section>
  );
}
