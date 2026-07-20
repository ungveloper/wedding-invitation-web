import FadeInUp from './components/common/FadeInUp';
import WeddingRibbon from './components/common/WeddingRibbon';
import HeartImage from './components/heart-image/HeartImage';
import { GowunDodum } from './lib/fonts';

type GreetingProps = {
  quote: string;
  quoteSource: string;
  messages: string[];
  groomParentsLabel: string;
  groomRelationLabel: string;
  groomName: string;
  brideParentsLabel: string;
  brideRelationLabel: string;
  brideName: string;
};

export default function Greeting({
  quote,
  quoteSource,
  messages,
  groomParentsLabel,
  groomRelationLabel,
  groomName,
  brideParentsLabel,
  brideRelationLabel,
  brideName,
}: GreetingProps): React.ReactElement {
  return (
    <section
      className={`mt-14 flex flex-col items-center ${GowunDodum.className}`}
    >
      <FadeInUp>
        <WeddingRibbon />

        <div className="mt-8 text-center">
          <p>{quote}</p>
          <p className="mt-2">{quoteSource}</p>
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="mx-auto my-10 h-px w-[20vw] bg-[repeating-linear-gradient(to_right,#999_0_4px,transparent_4px_10px)] bg-bottom bg-no-repeat bg-size-[100%_2px]" />
      </FadeInUp>

      <FadeInUp>
        <div className="w-full space-y-1.5 px-5 text-center text-[17px]">
          {messages.map((message, index) => (
            <p
              key={`${message}-${index}`}
              className={[
                index >= messages.length - 1 ? 'opacity-100' : 'opacity-80',
                index === 1 || index === 5 ? 'mb-6' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {message}
            </p>
          ))}
        </div>
      </FadeInUp>

      <FadeInUp>
        <div className="mx-auto mt-14 w-[66.6%] border-y border-y-gray-200 py-5">
          <div className="grid grid-cols-[auto_auto_auto] items-center justify-center gap-x-4 gap-y-3 text-[17px]">
            <p className="justify-self-center">{groomParentsLabel}</p>
            <p className="justify-self-center text-sm">{groomRelationLabel}</p>
            <p>{groomName}</p>
            <p className="justify-self-center">{brideParentsLabel}</p>
            <p className="justify-self-center text-sm">{brideRelationLabel}</p>
            <p>{brideName}</p>
          </div>
        </div>
      </FadeInUp>

      <HeartImage />
    </section>
  );
}
