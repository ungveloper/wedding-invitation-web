import Image from 'next/image';

const BASE_CLASS_NAME = 'mx-auto block h-auto w-30.5 object-contain';

export default function WeddingRibbon(): React.ReactElement {
  return (
    <Image
      className={`${BASE_CLASS_NAME}`}
      src="/images/message/decoration_ribbon.png"
      alt={'decoration_ribbon'}
      width={134}
      height={40}
    />
  );
}
