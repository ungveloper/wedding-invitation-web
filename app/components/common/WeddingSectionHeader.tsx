import { GowunDodum } from '@/app/lib/fonts';
import FadeInUp from './FadeInUp';
import WeddingRibbon from './WeddingRibbon';

type WeddingSectionHeaderProps = {
  id: string;
  title: string;
  className?: string;
};

export default function WeddingSectionHeader({
  id,
  title,
  className = '',
}: WeddingSectionHeaderProps): React.ReactElement {
  return (
    <header className={`block w-full text-center ${className}`.trim()}>
      <FadeInUp>
        <WeddingRibbon />
      </FadeInUp>

      <FadeInUp>
        <h2
          id={id}
          className={`m-0 ${GowunDodum.className} text-center text-2xl leading-normal tracking-[-0.045em]`}
        >
          {title}
        </h2>
      </FadeInUp>
    </header>
  );
}
