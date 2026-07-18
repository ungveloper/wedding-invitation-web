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
      <WeddingRibbon />

      <h2
        id={id}
        className="m-0 text-center text-2xl font-semibold leading-normal tracking-[-0.045em]"
      >
        {title}
      </h2>
    </header>
  );
}
