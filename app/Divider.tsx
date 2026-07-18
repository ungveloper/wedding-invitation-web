type DividerProps = {
  direction?: 'vertical' | 'horizontal';
};

export default function Divider({
  direction = 'vertical',
}: DividerProps): React.ReactElement {
  return (
    <section
      className={
        direction === 'vertical' ? 'mx-auto my-10 w-px h-15 bg-black/40' : ''
      }
    />
  );
}
