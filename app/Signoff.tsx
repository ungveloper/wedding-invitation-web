import Image from 'next/image';

export default function Signoff(): React.ReactElement {
  return (
    <section className="space-y-5">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src="/images/signoff/married.png"
          alt="married"
          fill
          className="object-cover"
        />
      </div>

      <video
        className="w-full object-cover"
        src="/images/signoff/signoff.mp4"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        aria-hidden="true"
      />

      <div className="relative w-full aspect-64/95">
        <Image
          src="/images/signoff/bowing.png"
          alt="bowing"
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}
