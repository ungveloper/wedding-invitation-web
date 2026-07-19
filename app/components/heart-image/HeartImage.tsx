import Image from 'next/image';
import FadeInUp from '../common/FadeInUp';

export default function HeartImage(): React.ReactElement {
  return (
    <FadeInUp>
      <div className="relative mx-auto mt-8 w-[66.6%] aspect-9/4">
        <Image
          src="/images/message/heart.png"
          alt="heart"
          fill
          draggable={false}
          className="pointer-events-none select-none object-cover [-webkit-user-drag:none]"
        />
      </div>
    </FadeInUp>
  );
}
