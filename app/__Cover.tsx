import type { CSSProperties, ReactElement } from 'react';
import Handwriting from './components/handwriting/Handwriting';
import { Solinsunny } from './lib/fonts';
import styles from './Cover.module.css';
import BackgroundEffect from './components/background-effect/BackgroundEffect';

type CoverProps = {
  photoSrc?: string;
  statement?: string;
  date?: string;
  groomLabel?: string;
  brideLabel?: string;
};

type CoverStyle = CSSProperties & {
  '--cover-photo': string;
};

export default function Cover({
  photoSrc = '/images/cover/heart-frame-photo.png',
  statement = 'Our wedding day',
  date = 'on September 20, 2026',
  groomLabel = 'Groom',
  brideLabel = 'Bride',
}: CoverProps): ReactElement {
  const coverStyle: CoverStyle = {
    '--cover-photo': `url("${photoSrc}")`,
  };

  return (
    <section className={styles.cover} style={coverStyle}>
      <div className={styles.effectLayer} aria-hidden="true">
        <BackgroundEffect variant="cherryBlossom" placement="container" />
      </div>

      <div className={`${styles.artwork} ${Solinsunny.className}`}>
        <div
          className={`${styles.layer} ${styles.photo}`}
          role="img"
          aria-label="웨딩 커버 사진"
        />

        <span
          className={`${styles.layer} ${styles.heartMask}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.layer} ${styles.heartOutline}`}
          aria-hidden="true"
        />

        <span
          className={`${styles.layer} ${styles.heartRedBottomLeft}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.layer} ${styles.heartRedMiddleRight}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.layer} ${styles.heartWhiteMiddleLeft}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.layer} ${styles.heartRedTopLeft}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.layer} ${styles.heartWhiteTopRight}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.layer} ${styles.heartWhiteBottomRight}`}
          aria-hidden="true"
        />

        <div className={`${styles.text} ${styles.title}`}>
          <Handwriting
            variant="gettingMarried"
            className={styles.titleHandwriting}
            color="#AA091C"
            duration={4}
            delay={0.7}
          />
        </div>
        <p className={`${styles.text} ${styles.statement}`}>{statement}</p>
        <p className={`${styles.text} ${styles.date}`}>{date}</p>

        <div className={`${styles.floatGroup} ${styles.groomFloatGroup}`}>
          <span
            className={`${styles.layer} ${styles.groomLabelBackground}`}
            aria-hidden="true"
          />

          <p className={`${styles.text} ${styles.groomLabel}`}>{brideLabel}</p>

          <span
            className={`${styles.layer} ${styles.groomWings}`}
            aria-hidden="true"
          />
        </div>

        <div className={`${styles.floatGroup} ${styles.brideFloatGroup}`}>
          <span
            className={`${styles.layer} ${styles.brideLabelBackground}`}
            aria-hidden="true"
          />

          <p className={`${styles.text} ${styles.brideLabel}`}>{groomLabel}</p>

          <span
            className={`${styles.layer} ${styles.brideWings}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
